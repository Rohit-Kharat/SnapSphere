import React from 'react'
import Posts from './Posts'

const Feed = () => {
  return (
    <div className='flex-1 my-8 flex flex-col items-center pl-0 md:pl-[20%] pb-16 md:pb-0'>
      <Posts />
    </div>
  )
}

export default Feed