import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

import * as tf from "@tensorflow/tfjs";

const Prediction = () => {
  const [predictionResult, setPredictionResult] = useState("");
  const [imageSrc, setImageSrc] = useState(undefined);
  const [imgDisplay, setImgDisplay] = useState("disabled");
  const [btnDisabled, setBtnDisabled] = useState("button-disabled");
  const imageRef = useRef(null);

  async function loadModel() {
    console.log("Cargando modelo...");
    const model = await tf.loadLayersModel("model/model.json");
    console.log("Modelo cargado...");
    return model;
  }
  async function loadModelMv() {
    console.log("Cargando modelo...");
    const model = await tf.loadLayersModel("modelmv/model.json");
    console.log("Modelo cargado...");
    return model;
  }

  function preprocessImage(image) {
    // Cargamos la imagen en escala de grises (1 canal).
    const tensor = tf.browser.fromPixels(image).mean(2).expandDims(2);

    console.log("img original " + tensor.shape);

    // Cambiamos el tamaño de la imagen a 224x224
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    console.log("img reshaped " + resized.shape);

    const offset = tf.scalar(255.0);

    // Normalizamos la imagen
    const normalized = tf.scalar(1.0).sub(resized.div(offset));
    console.log("img normalized " + normalized.shape);

    const batched = normalized.expandDims(0);
    console.log("img batched " + batched.shape);

    return batched;
  }

  async function handleFileChange(event) {
    setPredictionResult(""); // Reinicia el resultado de la predicción
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        setImageSrc(e.target.result);
        setImgDisplay("");
        setBtnDisabled("button-enabled");
      };

      reader.readAsDataURL(file);
    }
  }

  async function performInference(image) {
    let model;
    if (switchState) {
      console.log("MobileNet");
      model = await loadModelMv();
    } else {
      console.log("Basic Model");
      model = await loadModel();
    }

    // Preprocesa la imagen según las necesidades de tu modelo.
    const processedImage = preprocessImage(image);

    // Realiza la inferencia con el modelo.
    const predictions = await model.predict(processedImage).dataSync();

    // Encuentra la clase con la probabilidad más alta
    const maxIndex = predictions.indexOf(Math.max.apply(null, predictions));

    // Definir las clases según tu modelo
    const classes = ["Normal", "Tuberculosis"];

    console.log("Predicciones:", predictions);
    console.log("Predicción:", classes[maxIndex]);

    // Puedes mostrar los resultados en el estado
    setPredictionResult("Resultado de la detección: " + classes[maxIndex]);
  }

  async function handlePredictClick() {
    if (imageSrc != undefined) {
      await performInference(imageRef.current);
    } else {
      alert("Falta cargar una imagen");
    }
  }

  const [switchState, setSwitchState] = useState(false);
  const [usedModel, setUsedModel] = useState("Basic Model");

  const handleSwitchToggle = () => {
    setSwitchState(!switchState);
    if (switchState) {
      setUsedModel("Basic Model");
    } else {
      setUsedModel("MobileNet");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl font-semibold mb-16">Módulo de Detección</h1>
      <div className="switch-container text-center">
        <label className="switch">
          <input
            type="checkbox"
            checked={switchState}
            onChange={handleSwitchToggle}
          />
          <span className="btnSwitch"></span>
        </label>
        <p>{usedModel}</p>
      </div>
      <div className="flex items-center">
        <img
          ref={imageRef}
          id="imagePreview"
          alt="imagePreview"
          src={imageSrc}
          className={imgDisplay}
        />
        <div className="flex flex-col">
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            className="disabled"
          />
          <label htmlFor="fileInput" className="button button-enabled">
            Cargar imagen
          </label>
          <button
            id="predictButton"
            onClick={handlePredictClick}
            className={`button mt-6 ${btnDisabled}`}
          >
            Realizar Inferencia
          </button>
        </div>
      </div>
      <div id="predictionResult" className="text-2xl mt-6 h-10">
        {predictionResult}
      </div>
    </div>
  );
};

export default Prediction;
