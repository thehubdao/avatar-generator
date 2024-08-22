import fs from 'fs';
import path from 'path';

export default function handler(req:any, res:any) {
  const { nombre } = req.query;
  
  const rutaCarpeta = path.join(process.cwd(), 'public', 'avatar_portraits');
  const archivoPath = path.join(rutaCarpeta, nombre);

  try {
    const archivoBuffer = fs.readFileSync(archivoPath);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(archivoBuffer);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
}