"use client";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export default function Homepage() {
  return (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Section */}
        <div className="bg-white flex flex-col items-center justify-center p-12">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Sign Up
          </h1>
          <form className="w-full max-w-sm space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 font-semibold py-3 rounded-md"
            >
              Sign Up
            </Button>
          </form>
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Already have an account? Login
            </a>
          </div>
        </div>

        {/* Right Section */}
        <CardContent className="flex flex-col rounded items-center justify-center p-12 bg-gradient-to-br from-indigo-500  text-white">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 leading-tight text-black">
            Task Management System
          </h1>
          <p className="text-lg text-center max-w-md opacity-90 text-neutral-500">
            Organize, track, and complete your tasks with ease. Boost your
            productivity today!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
