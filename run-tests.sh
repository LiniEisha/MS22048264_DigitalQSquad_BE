#!/bin/bash
npx nyc --reporter=html --reporter=text --verbose mocha uploads/ticketing.test.js --exit --recursive --reporter spec
