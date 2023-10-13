#!/usr/bin/env node

import { ensureError } from 'common-stuff'

import { createAndRunApp } from './app'
;(() => {
  try {
    createAndRunApp()
  } catch (err) {
    console.error(ensureError(err).message)
    process.exit(1)
  }
})()

export * from './app'
export * from './core/config'
export * from './core/services/logging'
export * from './v1/services/openapi'
