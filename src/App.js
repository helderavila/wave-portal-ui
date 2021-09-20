import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'

import Home from './pages/Home'

export default function App() {
  return (
    <ChakraProvider>
      <Home />
    </ChakraProvider>
  )
}