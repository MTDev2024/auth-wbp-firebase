import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './configuration';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

const registerMenu = document.getElementById('register');
const loginMenu = document.getElementById('login');
const logoutMenu = document.getElementById('logout');
const authForm = document.querySelector('.authform');
const buttonForm = document.getElementById('buttonform');
const profilForm = document.querySelector(".profilform");
const profilButton = document.getElementById("profilbutton");
const contactMenu = document.getElementById('contact');
const contactForm = document.querySelector('.contactform');

let photo = null;

// init firebase app
const app = initializeApp(firebaseConfig);

// init services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Click sur menu Register
registerMenu.addEventListener('click', ()=>{
    // Affiche le formulaire d'authentification
    authForm.style.display = "flex";
    // Affiche "Register" sur le bouton
    buttonForm.innerText ="Register";
});

// Click sur menu Login
loginMenu.addEventListener('click', ()=>{
    // Affiche le formulaire d'authentification
    authForm.style.display = "flex";
    // Affiche "Login" sur le bouton
    buttonForm.innerText ="Login";
});

// Click sur menu logout
logoutMenu.addEventListener('click', ()=>{
    signOut(auth)
        .then ( () => console.log("Logout !"))
        .catch(error => alert(error.message));
});

onAuthStateChanged(auth, async user => {
    if(!user){
        // si on n'est pas identifié on désactive le menu logout
        logoutMenu.classList.add('disabled');
        loginMenu.classList.remove('disabled');
        registerMenu.classList.remove('disabled');
        // on cache le formulaire de profil
        profilForm.reset();
        img_photo.setAttribute('src', 'images/user.png');
        profilForm.style.display = "none";
    }else{
        // si on est déjà identifié on désactive le menu login & register
        logoutMenu.classList.remove('disabled');
        loginMenu.classList.add('disabled');
        registerMenu.classList.add('disabled');
        // on affiche le formulaire de profil et affiche les données de l'utilisateurs
        profilForm.style.display = "flex";
	    await displayUserData(user.email);
    }
 });

// Quand on click sur le bouton Login ou Register
authForm.addEventListener('submit', e =>{
    e.preventDefault();
    // réccupère les données du formulaire
    const email = authForm.email.value;
    const password = authForm.password.value;

    if(buttonForm.innerText == "Register"){
        // Si Register alors on crée un nouveau utilisateur
        createUserWithEmailAndPassword(auth, email, password)
            .then(()=>{
                // Efface le contenu du formulaire et l'enlève de l'écran 
                authForm.reset();
                authForm.style.display = "none";
            })
            .catch(error => alert(error.message));
    }else if(buttonForm.innerText == "Login"){
       // Si Login on s'identifie 
       signInWithEmailAndPassword(auth, email, password)
            .then(()=>{
                // Efface le contenu du formulaire et l'enlève de l'écran 
                authForm.reset();
                authForm.style.display = "none"; 
            })
            .catch(error => alert(error.message));
    }
});

/* Formulaire de profil */

const img_photo  = document.getElementById("photo");
const input_file = document.getElementById("photo_url");

// Quand on change la photo de profil on la charge et l'affiche dans l'élément <img>
input_file.addEventListener('change', e => {
    const input = e.target;
    if (input.files && input.files[0]) {
        // récupère le fichier photo pour le storage lors de la validation
        photo = input.files[0];
        const reader = new FileReader();

        reader.onload = e => img_photo.setAttribute('src', e.target.result);
        reader.readAsDataURL(input.files[0]);
    }
});

// Regarde si des données existent en database sur l'utilisateur et les affiche
async function displayUserData(email){
    profilForm.email.value = email;
    profilButton.innerText = "Enregistrer";
    await searchUserInDatabase(email, (user)=>{
        // inscrit dans le formulaire les données de l'utilisateur trouvé dans la database
        profilForm.id.value = user.id;
        profilForm.name.value = user.nom;
        profilForm.firstname.value = user.prenom;
        profilForm.phone.value = user.telephone;
	    img_photo.setAttribute('src', user.photo_url);
        profilButton.innerText = "Modifier";
    });
}