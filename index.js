const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('./src/module/users/user.model');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Campo email é obrigatório.' });
  }
  if (!senha) {
    return res.status(400).json({ message: 'Campo senha é obrigatório.' });
  }

  const usuarioExistente = await usuarioModel.findOne({ email });

  if (!usuarioExistente) {
    return res.status(400).json({ message: 'Usuário não cadastrado' });
  }

  const senhaVerificada = bcrypt.compareSync(senha, usuarioExistente.senha);

  if (!senhaVerificada) {
    return res.status(400).json({ message: 'Usuário ou senha incorretos.' });
  }

  const token = jwt.sign({ _id: usuarioExistente._id }, 'dnc');

  return res.status(200).json({ message: 'Login realizado com sucesso.', token });
});

app.get('/usuarios', async (req, res) => {
  const usuarios = await usuarioModel.find({});
  return res.status(200).json(usuarios);
});

app.post('/usuarios', async (req, res) => {
  const { nome, email, senha, cargo } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'O campo email é obrigatório.' });
  }
  if (!senha) {
    return res.status(400).json({ message: 'O campo senha é obrigatório.' });
  }

  const usuarioExistente = await usuarioModel.findOne({ email });

  if (usuarioExistente) {
    return res.status(400).json({ message: 'Usuário já existe.' });
  }

  const senhaCriptografada = bcrypt.hashSync(senha, 10);

  const usuario = await usuarioModel.create({
    nome,
    email,
    senha: senhaCriptografada,
    cargo,
  });

  return res.status(201).json(usuario);
});

app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, cargo } = req.body;

  const usuario = await usuarioModel.findById(id);

  if (!usuario) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  if (email) {
    const usuarioExistente = await usuarioModel.findOne({ email });

    if (usuarioExistente && usuarioExistente._id.toString() !== id) {
      return res.status(400).json({ message: 'Email já está em uso por outro usuário.' });
    }
  }

  const senhaCriptografada = senha ? bcrypt.hashSync(senha, 10) : usuario.senha;

  usuario.nome = nome || usuario.nome;
  usuario.email = email || usuario.email;
  usuario.senha = senhaCriptografada;
  usuario.cargo = cargo || usuario.cargo;

  await usuario.save();

  return res.status(200).json(usuario);
});

app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  const usuario = await usuarioModel.findByIdAndDelete(id);

  if (!usuario) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  return res.status(200).json({ message: 'Usuário deletado com sucesso.' });
});

app.listen(8080, () => {
  console.log('Servidor está rodando na porta 8080');
});