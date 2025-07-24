import React from 'react'
import AuthContent from '../api/AuthContent'

const WelcomePage = () => {
  return (
    <div className='justify-items-center'>
      <h1 className='text-lg font-bold'>Welcome to lane mapping application</h1>
      <AuthContent/>
    </div>
  )
}

export default WelcomePage
