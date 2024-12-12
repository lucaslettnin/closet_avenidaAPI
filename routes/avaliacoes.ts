import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      include: {
        cliente: true,
        produto: true
      }
    })
    res.status(200).json(avaliacoes)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", async (req, res) => {
  const { clienteId, produtoId, comentario, estrelas } = req.body

  if (!clienteId || !produtoId || !comentario || !estrelas) {
    res.status(400).json({ erro: "Informe clienteId, produtoId, estrelas e comentario" })
    return
  }

  try {
    const avaliacao = await prisma.avaliacao.create({
      data: { 
        clienteId, 
        produtoId, 
        comentario,
        estrelas
      }
    })
    res.status(201).json(avaliacao)
  } catch (error) {
    res.status(400).json(error)
  }
})

async function enviaEmail(nome: string, email: string,
  comentario: string, resposta: string) {

  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: {
      user: "968f0dd8cc78d9",
      pass: "89ed8bfbf9b7f9"
    }
  });

  const info = await transporter.sendMail({
    from: 'edeciofernando@gmail.com', // sender address
    to: email, // list of receivers
    subject: "Re: Avaliação Revenda Avenida", // Subject line
    text: resposta, // plain text body
    html: `<h3>Estimado Cliente: ${nome}</h3>
           <h3>Avaliação: ${comentario}</h3>
           <h3>Resposta da Revenda: ${resposta}</h3>
           <p>Muito obrigado pelo seu contato</p>
           <p>Revenda Avenida</p>`
  });

  console.log("Message sent: %s", info.messageId);
}

router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { resposta } = req.body

  if (!resposta) {
    res.status(400).json({ "erro": "Informe a resposta desta avaliação" })
    return
  }

  try {
    const avaliacao = await prisma.avaliacao.update({
      where: { id: Number(id) },
      data: { resposta }
    })

    const dados = await prisma.avaliacao.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: true
      }
    })

    enviaEmail(dados?.cliente.nome as string,
      dados?.cliente.email as string,
      dados?.comentario as string,
      resposta)

    res.status(200).json(avaliacao)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { clienteId },
      include: {
        produto: true
      }
    })
    res.status(200).json(avaliacoes)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
