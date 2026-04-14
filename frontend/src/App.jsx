import { useEffect, useState } from 'react'
import './App.css'
import {StartDisplay} from './components/StartDisplay'
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    setTimeout(()=>{
      setIsLoading(false);
    },3000)

  },[])

  if(isLoading){
    return(
      <>
        <StartDisplay/>
      </>
    )
  }

  return (
    <>
    </>
  )
}

export default App
