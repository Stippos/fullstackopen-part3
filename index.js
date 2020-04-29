const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()

morgan.token('post_data', function (req, res) { return req.method === 'POST' ? JSON.stringify(req.body) : '' })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_data'))

app.use(express.json())
app.use(cors())
app.use(express.static('build'))



app.get('/api/persons', (request, response) => {

  Person.find({}).then(persons => {
    response.json(persons.map(p => p.toJSON()))
  }).catch(error => {
    next(error)
  })
})

app.get('/api/persons/:id', (request, response) => {

  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => {
    next(error)
  })
})

app.get('/info', (request, response) => {

  Person.find({}).then(persons =>
    response.send(`Phonebook has info for ${persons.length} people <br> ${Date()}`)
  ).catch(error => {
    next(error)
  })

})


app.delete('/api/persons/:id', (request, response) => {

  Person.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => {
    next(error)
  })
})

app.put('/api/persons/:id', (request, response) => {

  const id = request.params.id

  const person = {
    name: request.body.name,
    number: request.body.number
  }

  Person.findByIdAndUpdate(id, person, { new: true }).then(result => {
    response.json(result.toJSON())
  }).catch(error => {
    next(error)
  }).catch(error => {
    next(error)
  })
})

app.post('/api/persons', (request, response) => {

  const body = request.body

  console.log(body)

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  Person.find({ name: { $eq: body.name } }).then(result => {
    if (!result) {
      return response.status(400).json({
        error: 'name must be unique'
      })
    }
  })

  const person = new Person({
    name: body.name,
    number: body.number
  })

  console.log(body.name)
  console.log(person.toJSON())

  person.save().then(result => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`)
    response.json(person.toJSON())
  }).catch(error => {
    next(error)
  })

})

app.get('/', (req, res) => {
  console.log(req.body)
  res.send('<h1>Hello</h1>')
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})