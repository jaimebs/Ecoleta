import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import api from  '../../services/api';
import logo from '../../assets/logo.svg';
import './styles.css';

interface Item{
  id: number,
  title: string,
  image_url: string
}

interface IBGEUFResponse{
  sigla: string
}

interface IBGECityResponse{
  nome: string
}

const Point = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');

  async function getItems() {
   const { data } = await api.get('/items');
   setItems(data);
  }

  async function getUf() {
    const { data } = await api.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    const ufInitials = data.map(uf => uf.sigla);
    setUfs(ufInitials);
  }

  async function getCity() {
    const { data } = await api.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`);
    const cities = data.map(city => (city.nome));
    setCities(cities);
  }

  useEffect(()=>{
    // Função do próprio navegador. 
    navigator.geolocation.getCurrentPosition(position =>{
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude])
    })  
  },[])

  useEffect(()=>{
    getItems();  
  },[])

  useEffect(()=>{
    getUf();  
  },[])

  useEffect(()=>{
    if(selectedUf !== '0'){
      getCity();  
    }
  },[selectedUf])

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
    
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logo do Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form>
        <h1>
          Cadastro do <br/> ponto  de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name"/>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email"/>
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp"/>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
              <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}/>
          </Map>
          
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (Uf)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={(e)=> setSelectedUf(e.target.value)}>
                <option value="0">Selecione uma Uf</option>
                {ufs.map(uf => (
                   <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={(e)=> setSelectedCity(e.target.value)}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => (
                   <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecion um ou mais Ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li key={item.id}>
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default Point
