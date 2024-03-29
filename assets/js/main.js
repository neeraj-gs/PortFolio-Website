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
// const scrollUp = () =>{
// 	const scrollUp = document.getElementById('scroll-up')
//     // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
// 	this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
// 						: scrollUp.classList.remove('show-scroll')
// }
// window.addEventListener('scroll', scrollUp)


/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')
    
const scrollActive = () =>{
  	const scrollDown = window.scrollY

	sections.forEach(current =>{
		const sectionHeight = current.offsetHeight,
			  sectionTop = current.offsetTop - 58,
			  sectionId = current.getAttribute('id'),
			  sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

		if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
			sectionsClass.classList.add('active-link')
		}else{
			sectionsClass.classList.remove('active-link')
		}                                                    
	})
}
window.addEventListener('scroll', scrollActive)


/*=============== DARK LIGHT THEME ===============*/ 
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-line'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'bx bx-moon' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
   origin:'top',
   distance:'60px',
   duration:2500,
   delay:400,
   // reset:true//Animations repeat
})

sr.reveal(`.home__perfil, .about__image`,{origin:'right'})
sr.reveal(`.home__name, .home__info, .about__container, .section__title-1, .about__info, .contact__socail, .contact__data`,{origin:'left'})


// Project Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.projects__card');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    // Remove active class from all buttons and add to the current clicked one
    filterButtons.forEach(button => button.classList.remove('active'));
    e.target.classList.add('active');

    // Filter projects based on the clicked button
    const filter = e.target.dataset.filter;
    projects.forEach((project) => {
      if (filter === 'all') {
        project.style.display = 'block'; // Show all projects under "All Projects"
      } else {
        // Check if project has a category that matches the filter
        if (project.dataset.category === filter) {
          project.style.display = 'block';
        } else {
          project.style.display = 'none';
        }
      }
    });
  });
});
