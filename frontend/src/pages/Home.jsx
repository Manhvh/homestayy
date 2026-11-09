import React from 'react'
import Hero from '../components/Hero'
import PopularDestinations from '../components/PopularDestinations'
import FeaturedDestination from '../components/FeaturedDestination'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  return (
    <>
      <Hero />
      <PopularDestinations />
      <FeaturedDestination />
      <NewsLetter />
    </>
  )
}

export default Home
