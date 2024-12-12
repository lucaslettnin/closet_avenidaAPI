import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

// Rota para criar um admin
router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ erro: "Informe nome, email e senha" });
    return;
  }

  if (senha.length < 8) {
    res.status(400).json({ erro: "A senha deve ter pelo menos 8 caracteres" });
    return;
  }

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(senha, salt);

  try {
    const admin = await prisma.admin.create({
      data: { nome, email, senha: hash },
    });
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ erro: "Erro ao criar admin", detalhes: error });
  }
});

// Rota para login do admin
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const mensaPadrao = "Login ou senha incorretos";
  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao });
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      res.status(400).json({ erro: mensaPadrao });
      return;
    }

    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY não definida no arquivo .env");
    }

    if (bcrypt.compareSync(senha, admin.senha)) {
      const token = jwt.sign(
        { admin_logado_id: admin.id, admin_logado_nome: admin.nome },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );

      res.status(200).json({ id: admin.id, nome: admin.nome, token });
    } else {
      res.status(400).json({ erro: mensaPadrao });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
