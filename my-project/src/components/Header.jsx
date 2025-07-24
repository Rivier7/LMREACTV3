import React from 'react'

const Header = () => {
  return (
    <header className="flex flex-col items-center bg-gray-950 text-white p-6 shadow-md">
      <h1 className="text-3xl font-bold mb-4">Marken</h1>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <a 
              href="/" 
              className="text-lg hover:text-blue-500 transition-colors"
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="/accounts" 
              className="text-lg hover:text-blue-500 transition-colors"
            >
              Accounts
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
