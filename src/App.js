import React from 'react'
import gql from 'graphql-tag'
import ApolloClient from 'apollo-client'
import { InMemoryCache  } from 'apollo-cache-inmemory'
import { ApolloProvider, Query } from 'react-apollo'
import { HttpLink } from 'apollo-link-http'

const uri = 'https://api.graph.cool/simple/v1/cixmkt2ul01q00122mksg82pn'
const cache = new InMemoryCache()
const data = {
  scrollOffset: {
    value: 0,
    __typename: 'ScrollOffset',
  },
}

cache.writeData({ data })
const link = new HttpLink({ uri })
const resolvers = {
  Mutation: {
    setScrollOffset: (_, { scrollOffset }, { cache }) => {
      const data = {
        scrollOffset: {
          value: scrollOffset,
          __typename: "ScrollOffset",
        }
      }
      cache.writeData({ data })
      return data
    },
  }
}
const typeDefs = gql`
  type ScrollOffset {
    value: Int
  }

  extend type Query {
    scrollOffset: ScrollOffset
  }

  extend type Mutation {
    setScrollOffset(scrollOffset: Int): ScrollOffset
  }
`

const client = new ApolloClient({ link, cache, resolvers, typeDefs })

const setScrollOffset = (scrollOffset) => {
  client.mutate({
    mutation: gql`
      mutation ScrollOffset($scrollOffset: Int) {
        setScrollOffset(scrollOffset: $scrollOffset) @client {
          scrollOffset {
            value
          }
        }
      }
    `,
    variables: { scrollOffset },
  })
}

const query = gql`
  query AppQuery {
    scrollOffset @client {
      value
    }
  }
`

export default class App extends React.Component {
  componentDidMount() {
    window.addEventListener('scroll', () => {
      setScrollOffset(window.pageYOffset)
    })
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <Query query={query}>
          {({ loading, error, data: { scrollOffset: { value } } }) => {
            return (
              <div className="scroll-value">
                {value}px
              </div>
            )
          }}
        </Query>
      </ApolloProvider>
    )
  }
}
