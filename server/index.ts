import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { router } from './routes.ts'
import { recordRequest } from './metrics.ts'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  res.on('finish', () => recordRequest(Date.now() - start))
  next()
})

app.use('/api', router)

app.listen(PORT, () => {
  console.log(`  API server → http://localhost:${PORT}/api`)
})
