import { useState } from 'react'

const PUNS = [
  "Ice to meet you...",
  "Allow me to break the ice...",
  "What killed the dinosaurs? The Ice Age!",
  "Stay cool, Birdboy.",
  "Tonight's forecast... a freeze is coming!",
  "Let's kick some ice!",
  "The Iceman cometh!",
  "In this universe, there's only one absolute... everything freezes!",
  "Tonight, hell freezes over!",
  "I'm afraid my condition has left me cold to your pleas of mercy.",
  "If revenge is a dish best served cold, then put on your Sunday finest.",
  "You're not sending me to the cooler!",
]

export default function SplashScreen({ username }) {
  const pun = useState(() => PUNS[Math.floor(Math.random() * PUNS.length)])[0]

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
      <img src="/pony.png" alt="" className="w-20 h-20 object-contain opacity-80" />
      <p className="text-white text-2xl font-bold text-center">{pun}</p>
      <p className="text-gray-600 text-sm">
        Welcome, {username.charAt(0).toUpperCase() + username.slice(1)}
      </p>
      <div className="flex gap-1 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}