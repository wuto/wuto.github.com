/*
  _    _ _   _ _ _ _        _          
 | |  | | | (_) (_) |      (_)         
 | |  | | |_ _| |_| |_ __ _ _ _ __ ___ 
 | |  | | __| | | | __/ _` | | '__/ _ \
 | |__| | |_| | | | || (_| | | | |  __/
  \____/ \__|_|_|_|\__\__,_|_|_|  \___|
                                       
*/
Math.linearTween = function(currentTime, debut, degreduChangement, duration) {
  return degreduChangement * currentTime / duration + debut;
};
Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};
Math.easeInOutQuart = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t * t * t + b;
  t -= 2;
  return -c / 2 * (t * t * t * t - 2) + b;
};
Math.outElastic = function(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (29.445 * tc * ts + -98.0825 * ts * ts + 113.88 * tc + -53.69 * ts + 9.4475 * t);
};

Math.inElastic = function(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (-5.3475 * tc * ts + 12.6475 * ts * ts + -10 * tc + 2.6 * ts + 1.1 * t);
};
var Utl = {};
// true si valeur est entre deux autres valeurs
Utl.entre = function(valeur, min, max) {
  return (valeur - min) * (valeur - max) < 0;
};
Utl.aleatoire = function(min, max) {
  return min + Math.random() * (max - min);
};
// Distance entre deux points
Utl.distance = function(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
Utl.lerp = function(value1, value2, amount) {
  return value1 + (value2 - value1) * amount;
};
// collision Point > Carre
Utl.pointCarre = function(x, y, carre) {
  return Calcul.entre(x, carre.pos.x, carre.pos.x + carre.taille) && Calcul.entre(y, carre.pos.y, carre.pos.y + carre.taille);
};
// Morceler un tableau de plusieurs lignes
Utl.morceler = function(tableau, largeur) {
  var resultat = [];
  for (var i = 0; i < tableau.length; i += largeur) resultat.push(tableau.slice(i, i + largeur))
  return resultat;
};

class Menu {
  constructor(parent, x, y, choix) {
    this.parent = parent;
    this.ctx = parent.ctx;
    this.choix = choix;
    this.pos = {
      x: x,
      y: y
    };
    this.actif = false;
    this.selection = 0;
    this.max = this.choix.length - 1;
    this.curseur = this.parent.ressources.curseur;
    this.touches = [];
    let valeur = [];
    for (var i = 0; i < this.choix.length; i++) {
      valeur.push(this.choix[i].nom.length);
    }
    this.texteMax = Math.max(...valeur) * 6 + 60;
  }
  changement(keyCode) {
    if (keyCode === 38 && this.selection > 0) {
      // haut
      this.parent.sons.selection.url.play();
      this.selection -= 1;
      this.rendu();
    } else if (keyCode === 40 && this.selection < this.max) {
      // bas
      this.parent.sons.selection.url.play();
      this.selection += 1;
      this.rendu();
    } else if (keyCode === 88) {
      // action
      this.parent.sons.validation.url.play();
      this.actif = false;
      this.parent.phase(this.choix[this.selection].lien);
    }
  }
  selectionne() {}
  rendu() {
    this.ctx.fillStyle = "#fff1e8";
    // dessiner le cadre 
    this.parent.boite(this.pos.x - this.texteMax / 2, this.pos.y - 10, this.texteMax, 26 * this.choix.length);
    // on affiche le titre
    for (var i = 0; i < this.choix.length; i++) {
      this.parent.ecrire(this.choix[i].nom, this.pos.x, this.pos.y + 25 * i);
    }
    // on affiche la selection
    this.ctx.drawImage(this.curseur.img, 48, 0, 16, 16, this.pos.x - this.texteMax / 2 + 8, this.pos.y + 25 * (this.selection) - 4, 16, 16);
  }
}
class Entite {
  constructor(monde, x, y, sprite) {
    this.monde = monde;
    this.limite = monde.limite;
    this.ctx = monde.ctx;
    this.pos = {
      x: x,
      y: y
    };
    this.taille = monde.taille;
    this.cible = {
      x: this.pos.x * this.taille,
      y: this.pos.y * this.taille,
    };
    this.depart = {
      x: this.pos.x * this.taille,
      y: this.pos.y * this.taille,
    };
    this.sprite = new Sprite(this.monde, this, sprite);
    this.transition = {
      etat: false,
      temps: null,
      duration: 200,
      style: "marche"
    };
    this.derniereDirection = "none";
    this.peutBouger = true;
    this.collision = false;
    this.validation = false;
    this.monde.sons.apparition.url.play();
    this.monde.effets.push(new Effet(this.monde, this.depart.x, this.depart.y, this.monde.ressources.explosion));
  }
  controles() {
    if (!this.transition.etat && this.peutBouger) {
      if (this.monde.touches[38]) {
        this.diriger("haut");
      }
      if (this.monde.touches[39]) {
        this.diriger("droite");
      }
      if (this.monde.touches[37]) {
        this.diriger("gauche");
      }
      if (this.monde.touches[40]) {
        this.diriger("bas");
      }
    }
  }
  diriger(direction) {
    let mouvement = {};
    switch (direction) {
      case "gauche":
        mouvement = {
          x: this.pos.x - 1,
          y: this.pos.y
        };
        break;
      case "droite":
        mouvement = {
          x: this.pos.x + 1,
          y: this.pos.y
        };
        break;
      case "bas":
        mouvement = {
          x: this.pos.x,
          y: this.pos.y + 1
        };
        break;
      case "haut":
        mouvement = {
          x: this.pos.x,
          y: this.pos.y - 1
        };
        break;
    }
    this.deplacer(mouvement, direction);
  }
  deplacer(coordonne, direction) {
    if (!this.transition.etat) {
      this.tuileCible = this.monde.infoClef(coordonne.x, coordonne.y);
      if (!this.tuileCible.collision) {
        if (this.tuileCible.action === "glace") {
          this.transition.style = "glace";
          this.transition.duration = 80;
        } else {
          this.transition.style = "marche";
          this.transition.duration = 200;
        }
        this.collision = false;
        this.validation = false;
        this.transition.etat = true;
        this.derniereDirection = direction;
        this.transition.temps = new Date();
        this.pos.x = coordonne.x;
        this.pos.y = coordonne.y;
        this.cible.x = this.pos.x * this.taille;
        this.cible.y = this.pos.y * this.taille;
      } else {
        this.collision = true;
      }
    }
  }
  translation() {
    if (this.transition.etat) {
      let time = new Date() - this.transition.temps;
      if (time < this.transition.duration) {
        if (this.transition.style === "marche") {
          this.sprite.pos.x = Math.easeInOutQuart(time, this.depart.x, this.cible.x - this.depart.x, this.transition.duration);
          this.sprite.pos.y = Math.easeInOutQuart(time, this.depart.y, this.cible.y - this.depart.y, this.transition.duration);
        } else {
          this.sprite.pos.x = Math.linearTween(time, this.depart.x, this.cible.x - this.depart.x, this.transition.duration);
          this.sprite.pos.y = Math.linearTween(time, this.depart.y, this.cible.y - this.depart.y, this.transition.duration);
        }
      } else {
        this.transition.etat = false;
        this.sprite.pos.x = this.cible.x;
        this.sprite.pos.y = this.cible.y;
        this.depart.x = this.cible.x;
        this.depart.y = this.cible.y;
        // en fonction du type de sol
        switch (this.tuileCible.action) {
          case "glace":
            this.diriger(this.derniereDirection);
            if (!this.collision) {
              this.peutBouger = false;
            } else {
              this.peutBouger = true;
            }
            break;
          case "gauche":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.diriger("gauche");
            break;
          case "haut":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.diriger("haut");
            break;
          case "bas":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.diriger("bas");
            break;
          case "droite":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.diriger("droite");
            break;
          case "piege":
            this.monde.sons.eboulement.url.play();
            this.monde.effets.push(new Effet(this.monde, this.pos.x * this.taille, this.pos.y * this.taille, this.monde.ressources.poussiere));
            this.monde.terrain.geometrie[this.pos.y][this.pos.x] = 7;
            this.peutBouger = true;
            break;
          case "suivant":
            this.validation = true;
            this.peutBouger = true;
            this.monde.action("suivant");
            break;
          default:
            this.monde.sons.mouvement.url.play();
            this.peutBouger = true;
            this.validation = false;
            // sol normal
        }
      }
    }
  }
  rendu() {
    this.sprite.rendu();
    this.translation();
    this.controles();
  }
}
class Effet {
  constructor(monde, x, y, sprite) {
    this.monde = monde;
    this.ctx = monde.ctx;
    this.sprite = sprite;
    this.taille = monde.taille;
    this.l = Math.round(this.sprite.img.width / this.sprite.sep),
      this.h = this.sprite.img.height / this.sprite.ligne
    this.pos = {
      x: x,
      y: y
    };
    this.longueur = this.sprite.sep;
    this.frame = 0;
    this.taille = monde.taille;
    this.selectLigne = 0;
    this.animation = true;
    this.allure = 0.4;
  }
  rendu() {
    if (this.animation) {
      this.frame += this.allure;
      if (this.frame >= this.longueur) {
        this.monde.effets.splice(this.monde.effets.indexOf(this), 1);
      }
    }
    this.ctx.drawImage(this.sprite.img, Math.floor(this.frame) * this.l, this.selectLigne, this.l, this.h, this.pos.x - this.l / 4, this.pos.y - this.l / 4, this.l, this.h);
  }
}
class Sprite {
  constructor(monde, parent, sprite) {
    this.ctx = monde.ctx;
    this.sprite = sprite;
    this.taille = monde.taille;
    this.l = Math.round(this.sprite.img.width / this.sprite.sep),
      this.h = this.sprite.img.height / this.sprite.ligne
    this.pos = {
      x: parent.pos.x * this.taille,
      y: parent.pos.y * this.taille
    };
    this.longueur = this.sprite.sep;
    this.frame = 0;
    this.taille = monde.taille;
    this.selectLigne = 0;
    this.animation = true;
    this.allure = 0.2;
  }
  dessiner() {
    this.ctx.drawImage(this.sprite.img, Math.floor(this.frame) * this.l, this.selectLigne, this.l, this.h, this.pos.x, this.pos.y, this.l, this.h);
  }
  animer() {
    if (this.animation) {
      this.frame += this.allure;
      if (this.frame >= this.longueur) {
        this.frame = 0;
      }
    }
  }
  rendu() {
    this.animer();
    this.dessiner();
  }
}

/*
   _____                      _     
  / ____|                    (_)    
 | |     ___   ___ _   _ _ __ _ ___ 
 | |    / _ \ / _ \ | | | '__| / __|
 | |___| (_) |  __/ |_| | |_ | \__ \
  \_____\___/ \___|\__,_|_(_)| |___/
                            _/ |    
                           |__/     
*/
class Monde {
  constructor(parametres, niveaux) {
    // parametres
    this.alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 ?!():'";
    this.taille = parametres.taille;
    this.touches = [];
    this.zoom = parametres.zoom || 2;
    this.remplissage = false;
    this.etat = "menu";
    // fps 
    this.fps = 60;
    // ressources
    this.prop = {
      compte: 0,
      nombreImg: parametres.stockImages.length + parametres.stockSon.length
    };
    this.ressources = {};
    // volume
    this.volumePrincipal = 0.05;
    // Chargement + lancement
    this.creerContexte();
    if (this.prop !== 0) {
      this.traitement(parametres.stockImages, parametres.stockSon, parametres.clefs);
    }
    // niveaux 
    this.niveaux = niveaux;
    this.niveauActuel = 0;
    // on recupere la derniere sauvegarde
    if (localStorage.copycat) {
      console.info('mémoire récupérée')
      this.niveauMax = JSON.parse(localStorage.copycat);
    } else {
      // s'il n'y a rien on genere une mémoire
      localStorage.setItem("copycat", JSON.stringify(5));
      this.niveauMax = JSON.parse(localStorage.copycat);
    }
    this.cat = [];
    // Menu niveaux
    let self = this;
    this.menuNiveaux = {
        monde: self,
        ctx: self.ctx,
        nombre: self.niveaux.length,
        selection: 0,
        rendu: function() {
          this.ctx.fillStyle = "#fff1e8";
          this.monde.boite(10, 10, this.monde.L - 20, 200 - 20);
          this.monde.ecrire("select level", this.monde.L / 2, 25);
          for (let i = 0; i < this.nombre; i++) {
            let numero = i + 1;
            if (i > this.monde.niveauMax-1) {
              this.ctx.globalAlpha = 0.6;
              this.monde.ctx.drawImage(this.monde.ressources.lock.img, (32 + Math.floor(i % 7) * 32) - this.monde.ressources.lock.img.width / 2, (64 + Math.floor(i / 7) * 32) + 10);
            }
            this.monde.ecrire(numero.toString(), 32 + Math.floor(i % 7) * 32, 64 + Math.floor(i / 7) * 32);
            this.ctx.globalAlpha = 1;
          }
          this.monde.ctx.drawImage(this.monde.ressources.curseur.img, 0, 16, 32, 32, 16 + Math.floor(this.selection % 7) * 32, 51 + Math.floor(this.selection / 7) * 32, 32, 32);
        },
        changement: function(keyCode) {
          if (keyCode === 38 && this.selection - 6 > 0) {
            // haut
            this.monde.sons.selection.url.play();
            this.selection -= 7;
            this.rendu();
          }
          if (keyCode === 40 && this.selection + 7 < this.monde.niveauMax) {
            // bas
            this.monde.sons.selection.url.play();
            this.selection += 7;
            this.rendu();
          }
          if (keyCode === 37 && this.selection > 0) {
            // gauche
            this.monde.sons.selection.url.play();
            this.selection -= 1;
            this.rendu();
          }
          if (keyCode === 39 && this.selection +1 < this.monde.niveauMax) {
            // droit
            this.monde.sons.selection.url.play();
            this.selection += 1;
            this.rendu();
          }
        }
      }
      //transition
    this.transition = {
      duration: 800,
    }
    this.effets = [];
  }
  creerContexte() {
      this.toile = document.createElement("canvas");
      this.ctx = this.toile.getContext('2d');
      this.L = this.toile.width = 16 * 16;
      this.H = this.toile.height = 16 * 16;
      this.limite = {
        x: this.L,
        y: this.H
      }
      this.toile.style.width = this.L * this.zoom + "px";
      this.toile.style.height = this.H * this.zoom + "px";
      this.ctx.msImageSmoothingEnabled = false;
      this.ctx.imageSmoothingEnabled = false;
      document.body.appendChild(this.toile);
      console.log('%c Monde créé ', 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
    }
    /*
       _____ _                                               _   
      / ____| |                                             | |  
     | |    | |__   __ _ _ __ __ _  ___ _ __ ___   ___ _ __ | |_ 
     | |    | '_ \ / _` | '__/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
     | |____| | | | (_| | | | (_| |  __/ | | | | |  __/ | | | |_ 
      \_____|_| |_|\__,_|_|  \__, |\___|_| |_| |_|\___|_| |_|\__|
                              __/ |                              
                             |___/                               
    */
  chargement() {
    this.prop.compte += 1;
    if (this.prop.compte === this.prop.nombreImg) {
      console.log('%c les ressources sont chargées ' + this.prop.nombreImg + " / " + this.prop.nombreImg, 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
      // menu
      let bouttons = [{
        nom: "start game",
        lien: "start"
      }, {
        nom: "levels",
        lien: "niveaux"
      }, {
        nom: "how to play",
        lien: "regles"
      }, {
        nom: "about",
        lien: "info"
      }, ];
      this.menu = new Menu(this, this.L / 2, 110, bouttons);
      // Fin de chargement
      this.phase("menu");
      document.addEventListener("keydown", event => this.touchePresse(event), false);
      document.addEventListener("keyup", event => this.toucheLache(event), false);
    } else {
      // écran de chargement
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, this.L, this.H);
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(0, (this.H / 2) - 1, (this.prop.compte * this.L) / this.prop.nombreImg, 2);
    }
  }
  chargerImages(url) {
    let img = new Image();
    let self = this;
    img.onload = function() {
      self.chargement();
    }
    img.src = url;
    return img;
  }
  chargerSon(url) {
    let audio = new Audio(url);
    audio.addEventListener('canplaythrough', this.chargement(), false);
    audio.volume = this.volumePrincipal;
    return audio;
  }
  traitement(stockImages, stockSon, clefs) {
      // traitement images
      let IM = {};
      for (let i = 0; i < stockImages.length; i++) {
        let sujet = stockImages[i];
        let nom = sujet.nom;
        sujet.img = this.chargerImages(stockImages[i].img);
        IM[nom] = stockImages[i];
      }
      this.ressources = IM;
      // traitement images
      let IS = {};
      for (let i = 0; i < stockSon.length; i++) {
        let sujet = stockSon[i];
        let nom = sujet.nom;
        sujet.url = this.chargerSon(stockSon[i].url);
        IS[nom] = stockSon[i];
      }
      this.sons = IS;
      //  traitement clefs
      this.nettoyer = new Array(clefs.length).fill(false)
      let CM = {};
      for (let i = 0; i < clefs.length; i++) {
        let sujet = clefs[i];
        let nom = sujet.id;
        if (sujet.type === "sprite") {
          sujet.frame = 0;
          sujet.sprite = this.ressources[sujet.apparence];
          sujet.memoireBoucle = false;
          sujet.peutAnimer = true;
          sujet.boucle = true;
        }
        CM[nom] = clefs[i];
      }
      this.clefs = CM;
    }
    /*
      ______      __                                 _   
     |  ____|    /_/                                | |  
     | |____   _____ _ __   ___ _ __ ___   ___ _ __ | |_ 
     |  __\ \ / / _ \ '_ \ / _ \ '_ ` _ \ / _ \ '_ \| __|
     | |___\ V /  __/ | | |  __/ | | | | |  __/ | | | |_ 
     |______\_/ \___|_| |_|\___|_| |_| |_|\___|_| |_|\__|
                                                         
                                                         
    */
  touchePresse(event) {
    this.touches[event.keyCode] = true;
    if (this.touches[70]) {
      this.activeRemplissage();
    }
    switch (this.etat) {
      case "menu":
        this.menu.changement(event.keyCode);
        break;
      case "start":
        if (this.touches[69] && this.animation) {
          this.sons.validation.url.play();
          this.phase("menu")
        }
        if (this.touches[82] && this.animation) {
          this.sons.validation.url.play();
          cancelAnimationFrame(this.animation);
          this.animation = null;
          this.arret = true;
          this.outro();
        }
        break;
      case "fin":
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu")
        }
        break;
      case "regles":
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu")
        }
        break;
      case "info":
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu")
        }
        break;
      case "niveaux":
        this.menuNiveaux.changement(event.keyCode);
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu")
        }
        if (this.touches[88]) {
          this.niveauActuel = this.menuNiveaux.selection;
          this.phase("start")
        }
        break;
      default:
        console.log("aucune touche reconnue");
    }
  }
  toucheLache(event) {
    this.touches[event.keyCode] = false;
  }
  activeRemplissage() {
      if (!this.remplissage) {
        this.toile.webkitRequestFullScreen()
        this.remplissage = true;
        this.toile.style.width = "100vmin";
        this.toile.style.height = "100vmin";
      } else {
        document.webkitCancelFullScreen()
        this.remplissage = false;
        this.toile.style.width = this.L * this.zoom + "px";
        this.toile.style.height = this.H * this.zoom + "px";
      }
    }
    /*
      ______               _   _                 
     |  ____|             | | (_)                
     | |__ ___  _ __   ___| |_ _  ___  _ __  ___ 
     |  __/ _ \| '_ \ / __| __| |/ _ \| '_ \/ __|
     | | | (_) | | | | (__| |_| | (_) | | | \__ \
     |_|  \___/|_| |_|\___|\__|_|\___/|_| |_|___/
                                                 
    */
  chercheClef(recherche) {
    let blockRecherche = [];
    for (var j = 0; j < this.terrain.dimension.y; j++) {
      for (var i = 0; i < this.terrain.dimension.x; i++) {
        let id = this.terrain.geometrie[j][i];
        if (this.clefs[id].nom === recherche) {
          let info = {
            pos: {
              x: i,
              y: j
            }
          }
          blockRecherche.push(info);
        }
      }
    }
    return blockRecherche;
  }
  infoClef(x, y) {
    if (x > -1 && x < this.terrain.dimension.x && y > -1 && y < this.terrain.dimension.y) {
      return this.clefs[this.terrain.geometrie[y][x]];
    } else {
      return false;
    }
  }
  ecrire(texte, x, y) {
    let largeur = 6,
      hauteur = 9;
    let centre = (texte.length * largeur) / 2
    for (let i = 0; i < texte.length; i++) {
      let index = this.alphabet.indexOf(texte.charAt(i)),
        clipX = largeur * index,
        posX = (x - centre) + (i * largeur);
      this.ctx.drawImage(this.ressources.pixelFont.img, clipX, 0, largeur, hauteur, posX, y, largeur, hauteur);
    }
  }
  boite(x, y, l, h) {
    this.ctx.fillStyle = "#fff1e8";
    // dessiner le fond
    this.ctx.fillRect(x + 1, y + 1, l - 2, h - 2);
    // dessiner les bords
    //haut Gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32, 16, 16, 16, x, y, 16, 16);
    //haut Droit
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16, 16, 16, x + l - 16, y, 16, 16);
    //bas Gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32, 16 + 8, 16, 16, x, y + h - 16, 16, 16);
    //bas Gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16 + 8, 16, 16, x + l - 16, y + h - 16, 16, 16);
    // haut
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 4, 16, 16, 16, x + 16, y, l - 32, 16);
    // bas
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 4, 16 + 8, 16, 16, x + 16, y + h - 16, l - 32, 16);
    // gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32, 16 + 4, 16, 16, x, y + 16, 16, h - 32);
    // droit
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16 + 4, 16, 16, x + l - 16, y + 16, 16, h - 32);
  }
  bitMasking() {
    let tuileBitMask = [];
    let compte = 0;
    this.terrain.apparence = [];
    for (var j = 0; j < this.terrain.dimension.y; j++) {
      for (var i = 0; i < this.terrain.dimension.x; i++) {
        let id = this.terrain.geometrie[j][i];
        // haut gauche droit bas
        let voisine = [0, 0, 0, 0];
        compte += 1;
        if (j - 1 > -1) {
          if (id === this.terrain.geometrie[j - 1][i]) {
            //haut
            voisine[0] = 1;
          }
        } else {
          voisine[0] = 1;
        }
        if (i - 1 > -1) {
          if (id === this.terrain.geometrie[j][i - 1]) {
            // gauche
            voisine[1] = 1;
          }
        } else {
          voisine[1] = 1;
        }
        if (i + 1 < this.terrain.dimension.x) {
          if (id === this.terrain.geometrie[j][i + 1]) {
            // droite
            voisine[2] = 1;
          }
        } else {
          voisine[2] = 1;
        }
        if (j + 1 < this.terrain.dimension.y) {
          if (id === this.terrain.geometrie[j + 1][i]) {
            //bas
            voisine[3] = 1;
          }
        } else {
          voisine[3] = 1;
        }
        id = 1 * voisine[0] + 2 * voisine[1] + 4 * voisine[2] + 8 * voisine[3];
        this.terrain.apparence.push(id);
      }
    }
    this.terrain.apparence = Utl.morceler(this.terrain.apparence, this.terrain.dimension.x);
  }
  renduTerrain() {
      for (let j = 0; j < this.terrain.dimension.y; j++) {
        for (let i = 0; i < this.terrain.dimension.x; i++) {
          let id = this.terrain.geometrie[j][i];
          if (this.clefs[id].apparence === "auto") {
            var sourceX = Math.floor(this.terrain.apparence[j][i]) * this.taille;
            var sourceY = Math.floor(this.terrain.apparence[j][i]) * this.taille;
            this.ctx.drawImage(this.ressources.feuille.img, sourceX, this.clefs[id].ligne * this.taille, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
          } else if (this.clefs[id].type === "sprite") {
            if (!this.clefs[id].memoireBoucle) {
              if (this.clefs[id].peutAnimer) {
                this.clefs[id].frame += this.clefs[id].allure;
              }
              if (this.clefs[id].frame >= this.clefs[id].sprite.sep) {
                if (!this.clefs[id].boucle) {
                  this.clefs[id].peutAnimer = false;
                }
                this.clefs[id].frame = 0;
              }
              this.clefs[id].memoireBoucle = true;
              // on sait quel id est déjà passé :^)
              this.nettoyer[id] = true;
            }
            this.ctx.drawImage(this.clefs[id].sprite.img, Math.floor(this.clefs[id].frame) * this.taille, 0, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
          } else {
            var sourceX = Math.floor(this.clefs[id].apparence % 16) * this.taille;
            var sourceY = Math.floor(this.clefs[id].apparence / 16) * this.taille;
            this.ctx.drawImage(this.ressources.feuille.img, sourceX, sourceY, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
          }
        }
      }
      for (var i = 0; i < this.nettoyer.length; i++) {
        if (this.nettoyer[i]) {
          this.clefs[i].memoireBoucle = false;
        }
      }
      if (this.niveaux[this.niveauActuel].indice) {
        this.boite(0, this.H - 32, this.L, 32);
        this.ecrire(this.niveaux[this.niveauActuel].indice, this.L / 2, this.H - 20);
      }

    }
    /*
      ______           _            
     |  ____|         (_)           
     | |__   _ __      _  ___ _   _ 
     |  __| | '_ \    | |/ _ \ | | |
     | |____| | | |   | |  __/ |_| |
     |______|_| |_|   | |\___|\__,_|
                     _/ |           
                    |__/            
    */
  initialiserMap() {
    this.terrain = {};
    this.arret = false;
    this.terrain.geometrie = JSON.parse(JSON.stringify(this.niveaux[this.niveauActuel].geometrie));
    this.terrain.dimension = {
      x: this.terrain.geometrie[0].length,
      y: this.terrain.geometrie.length
    };
    this.terrain.apparence = [];
    this.bitMasking();
  }
  initJoueur() {
    this.effets = [];
    this.cat = [];
    let posCat = this.chercheClef("joueur");
    for (var i = 0; i < posCat.length; i++) {
      this.cat.push(new Entite(this, posCat[i].pos.x, posCat[i].pos.y, this.ressources.joueurSprite));
    }
  }
  rendu() {
    this.renduTerrain();
    for (var i = 0; i < this.cat.length; i++) {
      this.cat[i].rendu();
    }
    for (var i = this.effets.length - 1; i >= 0; i--) {
      this.effets[i].rendu();
    }
    // afficher indice
  }
  boucle() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.L, this.H);
    this.rendu();
    if (!this.arret) {
      this.animation = requestAnimationFrame(() => this.boucle());
    }
  }
  outro() {

    cancelAnimationFrame(this.animation);
    this.animation = null;
    this.arret = true;

    this.ctx.fillStyle = "black";
    let x = 0;
    let cibleX = this.H / 2;
    let departX = 0;
    let monde = this;
    this.transition.temps = new Date();
    boucle();

    function boucle() {
      let time = new Date() - monde.transition.temps;
      if (time < monde.transition.duration) {
        monde.ctx.fillRect(0, 0, monde.L, x);
        monde.ctx.fillRect(0, monde.H, monde.L, x * -1);
        x = Math.easeInOutQuart(time, departX, cibleX - departX, monde.transition.duration);
        requestAnimationFrame(boucle);
      } else {
        if (monde.niveauActuel < monde.niveaux.length) {
          monde.phase("start");
          cancelAnimationFrame(boucle);
        } else {
          // fin du jeu
          monde.arret = true;
          monde.phase("fin");
          monde.niveauActuel = 0;
        }
      }
    }
  }

  intro() {
    this.initialiserMap();
    let x = this.H / 2;
    let cibleX = 0;
    let departX = this.H / 2;
    let monde = this;
    this.transition.temps = new Date();
    boucle();

    function boucle() {
      let time = new Date() - monde.transition.temps;
      if (time < monde.transition.duration) {
        monde.renduTerrain();
        monde.ctx.fillStyle = "black";
        monde.ctx.fillRect(0, 0, monde.L, x);
        monde.ctx.fillRect(0, monde.H, monde.L, x * -1);
        x = Math.easeInOutQuart(time, departX, cibleX - departX, monde.transition.duration);
        requestAnimationFrame(boucle);
      } else {

        monde.initJoueur();

        monde.boucle();
        cancelAnimationFrame(boucle);
      }
    }
  }

  phase(phase) {
    this.etat = phase;
    cancelAnimationFrame(this.animation);
    this.animation = null;
    this.ctx.fillStyle = "#fff1e8";
    this.ctx.fillRect(0, 0, this.L, this.H);
    switch (phase) {
      case "menu":
        // affiche le menu du jeu

        let pat = this.ctx.createPattern(this.ressources.pattern.img, "repeat");
        this.ctx.fillStyle = pat;
        this.ctx.fillRect(0, 0, this.L, this.H);

        this.ctx.drawImage(this.ressources.titre.img, 0, 0);
        this.menu.rendu();
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("arrow keys to select 'x' to confirm", this.L / 2, this.H - 30);
        break;
      case "start":
        this.intro();
        break;
      case "fin":
        // affiche le tableau de mort du joueur
        this.ecrire("thanks for playing :) !", this.L / 2, 15);
        this.ecrire("if you have something to tell me about", this.L / 2, 40);
        this.ecrire("this pen please do so", this.L / 2, 55);
        this.ecrire("in the comment section.", this.L / 2, 70);
        this.ecrire("any feedback is appreciated", this.L / 2, 85);
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
        break;
      case "regles":
        // affiche les regles
        this.ecrire("game control : ", this.L / 2, 15);
        this.ecrire("arrow keys to move", this.L / 2, 60);
        this.ecrire("'f' to toggle fullscreen", this.L / 2, 80);
        this.ecrire("'r' if you're stuck", this.L / 2, 100);
        this.ecrire("'e' to exit the game", this.L / 2, 120);
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
        break;
      case "info":
        // Affiche les infos
        this.ecrire("about : ", this.L / 2, 15);
        this.ecrire("made with html5 canvas", this.L / 2, 40);
        this.ecrire("by gtibo on codepen", this.L / 2, 55);
        this.ecrire("credits:", this.L / 2, 80);
        this.ecrire("sound effect : noiseforfun.com", this.L / 2, 100);
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
        break;
      case "niveaux":
        // Afficher menu niveaux
        this.menuNiveaux.rendu();
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 28);
        this.ecrire("arrow keys to select 'x' to confirm", this.L / 2, this.H - 30);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 20);
        break;
      default:
        console.log("aucune action reconnue");
    }
  }
  action(action) {
    switch (action) {
      case "suivant":
        let tab = [];
        for (var i = 0; i < this.cat.length; i++) {
          tab.push(this.cat[i].validation);
        }
        let confirmation = tab.every(function(vrai) {
          return vrai === true;
        });
        if (confirmation) {
            this.niveauActuel += 1;
          if (this.niveauMax < this.niveauActuel) {
            this.niveauMax = this.niveauActuel;
            localStorage.setItem("copycat", JSON.stringify(this.niveauActuel));
          }
          this.outro();
          this.sons.bravo.url.play();
        }

        break;
      case "autre":
        break;
      default:
        console.log("aucune action reconnue");
    }
  }
}

let parametres = {
  taille: 16,
  zoom: 2,
  stockImages: [{
    img: "https://image.ibb.co/mHNuWF/font.png",
    nom: "pixelFont"
  }, {
    img: "https://image.ibb.co/hzo1BF/curseur.png",
    nom: "curseur"
  }, {
    img: "https://image.ibb.co/j1Zmdv/titre.png",
    nom: "titre"
  }, {
    img: "https://image.ibb.co/hKwMBF/joueur.png",
    nom: "joueurSprite",
    sep: 12,
    ligne: 1
  }, {
    img: "https://image.ibb.co/h2Ns1F/explosion.png",
    nom: "explosion",
    sep: 9,
    ligne: 1
  }, {
    img: "https://image.ibb.co/b7aegF/feuille.png",
    nom: "feuille"
  }, {
    img: "https://image.ibb.co/mwXuWF/sortie.png",
    nom: "sortie",
    sep: 10
  }, {
    img: "https://image.ibb.co/k95ZFa/poussiere.png",
    nom: "poussiere",
    sep: 9,
    ligne: 1
  }, {
    img: "https://image.ibb.co/j7aZFa/pattern.png",
    nom: "pattern"
  }, {
    img: "https://image.ibb.co/gAGzyv/lock.png",
    nom: "lock"
  }, ],
  stockSon: [{
    url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-select-04.wav",
    nom: "mouvement"
  }, {
    url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-select.wav",
    nom: "selection"
  }, {
    url: "http://www.noiseforfun.com/waves/musical-and-jingles/NFF-bravo.wav",
    nom: "bravo"
  }, {
    url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-click-switch.wav",
    nom: "validation"
  }, {
    url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-bubble-input.wav",
    nom: "apparition"
  }, {
    url: "http://www.noiseforfun.com/waves/action-and-game/NFF-moving-block.wav",
    nom: "eboulement"
  }, ],
  clefs: [{
    type: "tuile",
    nom: "eau",
    id: 0,
    collision: true,
    apparence: "auto",
    ligne: 3
  }, {
    type: "tuile",
    nom: "herbe",
    id: 1,
    collision: false,
    apparence: 1
  }, {
    type: "tuile",
    nom: "mur",
    id: 2,
    collision: true,
    apparence: "auto",
    ligne: 1
  }, {
    type: "tuile",
    nom: "glace",
    action: "glace",
    id: 3,
    collision: false,
    apparence: "auto",
    ligne: 2
  }, {
    type: "sprite",
    nom: "suivant",
    id: 4,
    collision: false,
    action: "suivant",
    apparence: "sortie",
    ligne: 2,
    allure: 0.3
  }, {
    type: "tuile",
    nom: "joueur",
    id: 5,
    collision: false,
    apparence: 5
  }, {
    type: "tuile",
    nom: "piege",
    action: "piege",
    id: 6,
    collision: false,
    apparence: 6
  }, {
    type: "tuile",
    nom: "trou",
    id: 7,
    collision: true,
    apparence: 7
  }, {
    type: "tuile",
    nom: "barriere",
    id: 8,
    collision: true,
    apparence: "auto",
    ligne: 4
  }, {
    type: "tuile",
    nom: "flecheGauche",
    action: "gauche",
    id: 9,
    collision: false,
    apparence: 9
  }, {
    type: "tuile",
    nom: "flecheHaut",
    action: "haut",
    id: 10,
    collision: false,
    apparence: 10
  }, {
    type: "tuile",
    nom: "flecheDroite",
    action: "droite",
    id: 11,
    collision: false,
    apparence: 11
  }, {
    type: "tuile",
    nom: "flecheBas",
    action: "bas",
    id: 12,
    collision: false,
    apparence: 12
  }, ],

}
let niveaux = [

  {
    "nom": "debut",
    "indice": "try to move forward",
    "geometrie": [
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 8, 4, 8, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 8, 5, 8, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }, {
    "nom": "adeuxcestmieux",
    "geometrie": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 8, 8, 8, 8, 8, 1, 1, 8, 8, 8, 8, 8, 1, 1],
      [1, 1, 8, 1, 1, 1, 8, 1, 1, 8, 1, 1, 1, 8, 1, 1],
      [1, 1, 8, 1, 4, 1, 8, 1, 1, 8, 1, 4, 1, 8, 1, 1],
      [1, 1, 8, 1, 1, 1, 8, 1, 1, 8, 1, 1, 1, 8, 1, 1],
      [1, 1, 8, 1, 1, 1, 8, 1, 1, 8, 1, 1, 1, 8, 1, 1],
      [1, 1, 8, 2, 2, 1, 8, 1, 1, 8, 1, 2, 2, 8, 1, 1],
      [1, 1, 8, 1, 1, 1, 8, 1, 1, 8, 1, 1, 1, 8, 1, 1],
      [1, 1, 8, 1, 5, 1, 8, 1, 1, 8, 1, 5, 1, 8, 1, 1],
      [1, 1, 8, 1, 1, 1, 8, 1, 1, 8, 1, 1, 1, 8, 1, 1],
      [1, 1, 8, 8, 8, 8, 8, 1, 1, 8, 8, 8, 8, 8, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }, {
    "nom": "séparé",
    "geometrie": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 1, 1],
      [1, 1, 2, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 1, 1],
      [1, 1, 2, 1, 1, 1, 1, 0, 0, 1, 4, 1, 1, 2, 1, 1],
      [1, 1, 2, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 1, 1],
      [1, 1, 2, 4, 1, 1, 1, 0, 0, 1, 2, 1, 1, 2, 1, 1],
      [1, 1, 2, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 1, 1],
      [1, 1, 2, 8, 8, 8, 1, 0, 0, 1, 1, 1, 1, 2, 1, 1],
      [1, 1, 2, 5, 1, 1, 1, 0, 0, 1, 1, 5, 1, 2, 1, 1],
      [1, 1, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },

  {
    "nom": "aquatrecestmieux",
    "geometrie": [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 5, 1, 1, 1, 1, 2],
      [2, 1, 2, 4, 1, 1, 1, 0, 0, 1, 1, 1, 4, 1, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 5, 1, 0, 0, 1, 2, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 4, 1, 1, 0, 0, 1, 1, 1, 4, 5, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      [2, 2, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 5, 1, 1, 1, 0, 0, 1, 1, 1, 2, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    ]
  },

  {
    "nom": "introTrou",
    "indice": "you can restart with touch 'r'",
    "geometrie": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 1, 5, 8, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 8, 6, 8, 8, 8, 8, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 6, 1, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 8, 8, 8, 1, 8, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 6, 8, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 8, 1, 8, 8, 8, 8, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 6, 1, 1, 1, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 8, 8, 8, 8, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 1, 8, 4, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }, {
    "nom": "introGlace",
    "indice": "you can't change your direction on ice",
    "geometrie": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 8, 8, 8, 8, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 1, 5, 1, 1, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 1, 1, 1, 1, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 1, 2, 2, 2, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 3, 3, 3, 3, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 3, 3, 3, 3, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 3, 3, 1, 3, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 2, 3, 3, 3, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 3, 3, 3, 3, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 3, 3, 3, 3, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 3, 3, 4, 3, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 8, 8, 8, 8, 8, 8, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }, {
    "nom": "glisseadeux",
    "geometrie": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 8, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 4, 1, 1, 1, 1, 1, 8, 5, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 8, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 5, 1, 3, 3, 3, 3, 3, 4, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }, {
    "nom": "ice cavern",
    "geometrie": [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 4, 2, 2],
      [2, 2, 2, 3, 3, 2, 3, 3, 2, 3, 2, 2, 3, 2, 2, 2],
      [2, 2, 2, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 2, 3, 3, 3, 3, 1, 1, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 5, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2],
      [2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    ]
  }, {
    "nom": "introswitch",
    "indice": "switches are cool",
    "geometrie": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 12, 3, 3, 3, 9, 5, 8, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 3, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 8, 4, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 8, 4, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 3, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 10, 3, 3, 3, 9, 5, 8, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }, {
    "nom": "glissefeche",
    "geometrie": [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 3, 3, 11, 1, 3, 3, 3, 3, 12, 2, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 4, 3, 3, 3, 2, 3, 3, 2, 2, 2],
      [2, 2, 2, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 5, 3, 2, 2, 2],
      [2, 2, 2, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 2, 2, 2],
      [2, 2, 2, 3, 3, 11, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 2, 2, 2],
      [2, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 10, 2, 2, 2],
      [2, 2, 2, 3, 3, 3, 5, 3, 3, 3, 3, 3, 3, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    ]
  }, {
    "nom": "unpeudaide",
    "geometrie": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1],
      [1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1],
      [1, 1, 8, 4, 8, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1],
      [1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1, 8, 1, 8, 1, 1],
      [1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1, 8, 6, 8, 1, 1],
      [1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1, 8, 4, 8, 1, 1],
      [1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1, 8, 3, 8, 1, 1],
      [1, 1, 8, 5, 8, 1, 1, 1, 1, 1, 1, 8, 3, 8, 1, 1],
      [1, 1, 8, 1, 8, 1, 1, 1, 1, 1, 1, 8, 5, 8, 1, 1],
      [1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }
];

let demo = new Monde(parametres, niveaux);