import img from '../assets/20.png';

console.log('==========img ', img);

const pic = new Image();
pic.src = img;

document.body.appendChild(pic);