const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// 🔗 conecta a MongoDB (usa TU URI)
mongoose.connect("mongodb://127.0.0.1:27017/mycloset", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function crearAdmin() {
  const email = "hawer12@outlook.es";
  const passwordPlano = "123456";

  // verificar si ya existe
  const existe = await User.findOne({ email });
  if (existe) {
    console.log("❌ El usuario ya existe");
    process.exit();
  }

  // encriptar contraseña
  const hash = await bcrypt.hash(passwordPlano, 10);

  // crear usuario
  const user = new User({
    email,
    password: hash,
    role: "admin"
  });

  await user.save();
  console.log("✅ Usuario admin creado correctamente");
  process.exit();
}

crearAdmin();
