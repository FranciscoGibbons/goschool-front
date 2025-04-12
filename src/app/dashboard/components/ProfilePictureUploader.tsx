'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

export default function ProfilePictureUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [message, setMessage] = useState('');
  const defaultImage = '/images/default.jpg'; // Ruta de la imagen predeterminada

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setMessage('Por favor seleccione una imagen primero');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/upload_profile_picture/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
       
          },
          withCredentials: true, // Importante: esto envía las cookies
        }
      );

      if (res.status === 200) {
        setMessage('Imagen subida correctamente');
      } else {
        setMessage('Error al subir la imagen');
      }
    } catch {
      setMessage('Error al subir la imagen 1');
    }

    getProfilePicture();
  };

  const getProfilePicture = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8080/api/v1/get_profile_picture/',
        {
          withCredentials: true, // Las cookies se envían aquí también
        }
      );

      if (res.status === 200) {
        setPreview(res.data.url); // Actualiza la URL con la respuesta del backend
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        setPreview(defaultImage);
        setMessage('Imagen de perfil no encontrada');
      } else {
        setPreview(defaultImage);
      }
    }
  };

  useEffect(() => {
    getProfilePicture();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      {preview && (
        <Image
          src={preview}
          alt="Imagen de perfil"
          width={128}
          height={128}
          className="rounded-full border-2 border-blue-600 mb-4"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file:border file:px-4 file:py-2 file:rounded-md"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Subir imagen
      </button>
      {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
    </div>
  );
}
