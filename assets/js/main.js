/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

if(navToggle){
   navToggle.addEventListener('click',()=>{
      navMenu.classList.add('show-menu')
   })
}

if(navClose){
   navClose.addEventListener('click',()=>{
      navMenu.classList.remove('show-menu')
   })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction=()=>{
   const navMenu = document.getElementById('nav-menu')
   navMenu.classList.remove('show-menu')
}
navLink.forEach(n=>n.addEventListener('click',linkAction))

/*=============== SHADOW HEADER ===============*/
const shadowHeader = ()=>{
   const header = document.getElementById('header')
   this.scrollY >= 50 ? header.classList.add('shadow-header'): header.classList.remove('shadow-header')            
}
window.addEventListener('scroll',shadowHeader)


/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message')

const sendEmail = (e) => {
   e.preventDefault()

   //serviceId -template - #form - publicKey
   emailjs.sendForm('service_igdz0kb','template_d0mcsja','#contact-form','8p5Rtz2gkLnCzzsTM')
   .then(()=>{
      //show sent message
// This code snippet adds functionality to a website's navigation menu. It allows the menu to be shown or hidden when the toggle button is clicked, and it also removes the menu when a link is clicked. Additionally, it adds a shadow to the header when
      contactMessage.textContent = 'Message Sent Successfully '

      //remving msg after 5 sec
      setTimeout(()=>{
         contactMessage.textContent = ''
      },5000)


      //clear input fields
      contactForm.reset();
   },()=>{
      //show error messafe
      contactMessage.textContent = 'Message Not Sent (Service Error) , Contact using Social links'
   })
}

contactForm.addEventListener('submit',sendEmail)

/*=============== SHOW SCROLL UP ===============*/ 


/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/


/*=============== DARK LIGHT THEME ===============*/ 


/*=============== SCROLL REVEAL ANIMATION ===============*/
