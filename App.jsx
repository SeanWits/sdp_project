import "./App.css"
import { useState } from "react"
import logo from './logo outline transparent.png'

export default function App(){

  const userPrefs = []
  const prefOptions = ["Halaal", "Vegan", "Vegetarian"]

  const [allchecked, setAllChecked] = useState(userPrefs)
  const [options, setOptions] = useState(prefOptions)

  function handleChange(e) {
    if (e.target.checked) {
       setAllChecked([...allchecked, e.target.value]);
    } else {
       setAllChecked(allchecked.filter((item) => item !== e.target.value));
    }
 }

  return (
    <div className="App"> 
    {/* <header className = "navbar">Navbar
      <img src={logo} alt="Logo" className="App-logo"/>
    </header> */}
    <header className="App-header">Dietary Preferences</header>

    
    <ul className="list-checkBox">
    {options.map(prefs => {
      return (
        <li>
        <label htmlFor={prefs} className="checkBox">
        <input type="checkbox" id={prefs} value={prefs} onChange={handleChange} defaultChecked = {allchecked.includes(prefs)}/>
        {prefs}
        </label>
        </li>
      )
    })}
    </ul>

    {/* <div> Your preferences are: {allchecked.join(" ,")}</div> */}

    {/* <footer className="bottomBar">goodbye</footer> */}

    </div>
  )
}
