import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "../components/Credenciales";
import Vector from "../Vector.png";
import Vector1 from "../Vector1.png";
import Vector2 from "../Vector2.png";
import { Link } from "react-router-dom";
import flecha from "../flecha.png";

interface User {
  displayName: string;
  displayEmail: string;
  photoURL: string;
  peso: string;
  altura: string;
  edad: string;
}

export function Perfil() {
  const { user, logOut } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [, setAgregoCambio] = useState(false);

  const cerrarSesion = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            displayName: user.displayName || "No disponible",
            displayEmail: user.email || "No disponible",
            photoURL: user.photoURL || "",
            peso: data.peso || "No disponible",
            altura: data.altura || "No disponible",
            edad: data.edad || "No disponible",
          });
        } else {
          console.log("El documento del usuario no existe.");
        }
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdatePhotoURL = async () => {
    if (!user || !photoUrlInput) {
      alert("Debes ingresar una URL válida.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { photoURL: photoUrlInput });

      setUserData((prevData) => {
        if (!prevData) return null;
        return { ...prevData, photoURL: photoUrlInput };
      });

      setAgregoCambio(false);
      alert("Imagen de perfil actualizada correctamente.");
    } catch (error) {
      console.error("Error al actualizar la imagen de perfil:", error);
      alert("Hubo un error al actualizar la imagen.");
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!userData) {
    return <div>No se encontraron datos del usuario.</div>;
  }

  const { displayName, displayEmail, photoURL, peso, altura, edad } = userData;

  return (
    <div>
      <button className="flecha">
        <Link to="/inicio">
          {" "}
          <img className="flechas" src={flecha} alt="flecha" />{" "}
        </Link>
      </button>

      <img
        src={photoURL}
        alt="Foto de perfil"
        style={{ width: "150px", borderRadius: "50%" }}
      />

      <input
        type="text"
        placeholder="Ingresa URL de la nueva imagen"
        value={photoUrlInput}
        onChange={(e) => setPhotoUrlInput(e.target.value)}
      />
      <button onClick={handleUpdatePhotoURL}>Guardar o Actualizar</button>

      <p>
        <img className="mini-img" src={Vector} alt="Icono de peso" /> Peso:{" "}
        {peso}
      </p>
      <p>
        <img className="mini-img" src={Vector1} alt="Icono de altura" /> Altura:{" "}
        {altura}
      </p>
      <p>
        <img className="mini-img" src={Vector2} alt="Icono de edad" /> Edad:{" "}
        {edad}
      </p>
      <h1>{displayName}</h1>
      <p>{displayEmail}</p>

      <button onClick={cerrarSesion}>Cerrar Sesion</button>
    </div>
  );
}

export default Perfil;
