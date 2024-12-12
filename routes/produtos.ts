import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// Rota GET para buscar todos os produtos
router.get("/", async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany()
    res.status(200).json(produtos)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Rota POST para criar um novo produto
router.post("/", async (req, res) => {
  const { modelo, preco, foto, descricao } = req.body

  if (!modelo || !preco || !foto) {
    res.status(400).json({ "erro": "Informe todos os campos obrigatórios: modelo, preco, foto" })
    return
  }

  try {
    const produto = await prisma.produto.create({
      data: { modelo, preco, foto, descricao }
    })
    res.status(201).json(produto)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Rota DELETE para deletar um produto
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const produto = await prisma.produto.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Rota PUT para atualizar um produto
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { modelo, preco, foto } = req.body

  if (!modelo || !preco || !foto) {
    res.status(400).json({ "erro": "Informe todos os campos obrigatórios: modelo, preco, foto" })
    return
  }

  try {
    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: { modelo, preco, foto }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Rota GET para buscar produtos por um termo de pesquisa
router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params
  const termoNumero = Number(termo)

  if (isNaN(termoNumero)) {
    // Busca por modelo, ou descricao
    try {
      const produtos = await prisma.produto.findMany({
        where: {
          OR: [
            { modelo: { contains: termo } },           
            { descricao: { contains: termo } }
          ]
        }
      })
      res.status(200).json(produtos)
    } catch (error) {
      res.status(400).json(error)
    }
  } else {
    // Busca por preço
    try {
      const produtos = await prisma.produto.findMany({
        where: {
          preco: { lte: termoNumero }
        }
      })
      res.status(200).json(produtos)
    } catch (error) {
      res.status(400).json(error)
    }
  }
})

// Rota GET para buscar um produto pelo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
