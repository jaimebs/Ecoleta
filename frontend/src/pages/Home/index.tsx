import React from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import './styles.css';
import logo from '../../assets/logo.svg';

const Home = () => {
  return (
     <div id="page-home">
       <div className="content">
         <header>
            <img src={logo} alt="Logo do Ecoleta"/>
         </header>

         <main>
           <h1>
             Seu marketplace de coletas de resíduos.
           </h1>

           <p>
             Ajudamos pessoas a encontrarem pontos de coletas de forma eficiênte.
           </p>

           <Link to="/point">
             <span>
               <FiLogIn/>
             </span>
             <strong>Cadastre um ponto de coleta</strong>
           </Link>
         </main>
       </div>
     </div>
  )
}

export default Home;
