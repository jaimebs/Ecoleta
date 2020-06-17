import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react'
import { Link, useHistory } from 'react-router-dom';
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
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const history = useHistory();

  async function getItems() {
   const { data } = await api.get('/items');
   setItems(data);
  }

  async function getUf() {
    const { data } = await api.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    const ufInitials = data.map(uf => uf.sigla);
    setUfs(ufInitials);
  }

  const getCity = useCallback(async () => {
    const { data } = await api.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`);
    const cities = data.map(city => (city.nome));
    setCities(cities);
  },[selectedUf])

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
  },[getCity, selectedUf])

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;
    setFormData({...formData, [name]: value})
  }

  function handleSelectedItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    
    if(alreadySelected >= 0){
      const filterItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filterItems);
    }else {
      setSelectedItems([...selectedItems, id])
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const [latitude, longitude] = selectedPosition;
    const uf = selectedUf;
    const city = selectedCity;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    }
    
    await api.post('points', data);

    alert('Ponto cadastrado com sucesso!');

    // Navegar de volta para tela inicial.
    history.push('/');
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

      <form onSubmit={(e) => handleSubmit(e)}>
        <h1>
          Cadastro do <br/> ponto  de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange}/>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange}/>
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
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
              <li key={item.id} onClick={()=> handleSelectedItem(item.id)} className={selectedItems.includes(item.id) ? 'selected': ''}>
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
