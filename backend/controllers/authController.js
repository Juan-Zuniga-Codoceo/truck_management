const { User } = require('../models');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario
    const user = await User.create({ username, email, password: hashedPassword });

    return res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (error) {
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por correo electrónico
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Aquí puedes generar un token JWT si es necesario

    return res.status(200).json({ message: 'Inicio de sesión exitoso', user });
  } catch (error) {
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };