import * as React from 'react';

const Dropdown = ({ options, title, propSetter }) => {

 const [value, setValue] = React.useState('fruit');

 const handleChange = (event) => {

   propSetter(event.target.value);
   setValue(event.target.value);

 };

 return (

   <div style={{minWidth : "300px"}}>

     <label>

       {title}

       <select value={value} onChange={handleChange}>

       {options.map((option) => <option key={option} value={option}>{option}</option>)}

       </select>

     </label>

     <p>We eat {value}!</p>

   </div>

 );

};

export default Dropdown;