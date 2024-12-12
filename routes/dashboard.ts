import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

// Rota para contar clientes, produtos e avaliações
router.get("/gerais", async (req, res) => {
  try {
    const clientes = await prisma.cliente.count();
    const produtos = await prisma.produto.count();
    const avaliacoes = await prisma.avaliacao.count();

    res.status(200).json({ clientes, produtos, avaliacoes });
  } catch (error) {
    res.status(400).json({ erro: "Erro ao buscar dados gerais", detalhes: error });
  }
});

// Rota para agrupar avaliações por produtos
router.get("/avaliacoesPorProduto", async (req, res) => {
  try {
    // Agrupa as avaliações pelo `produtoId` e conta a quantidade por produto
    const avaliacoes = await prisma.avaliacao.groupBy({
      by: ["produtoId"],
      _count: {
        id: true,
      },
    });

    // Para cada grupo, busca o nome do produto relacionado
    const avaliacoesPorProduto = await Promise.all(
      avaliacoes.map(async (avaliacao) => {
        const produto = await prisma.produto.findUnique({
          where: { id: avaliacao.produtoId },
        });

        return {
          produto: produto?.modelo,
          numAvaliacoes: avaliacao._count.id,
        };
      })
    );

    res.status(200).json(avaliacoesPorProduto);
  } catch (error) {
    res.status(400).json({ erro: "Erro ao buscar avaliações por produto", detalhes: error });
  }
});

export default router;
