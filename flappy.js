  


//cria novo elemento
function novoElemento(tagName,className){
    const elem =document.createElement(tagName)
    elem.className=className
    return elem
}
//cria barreira
function Barreira(reversa = false){
    this.elemento = novoElemento('div','barreira')


    const borda = novoElemento('div','borda')
    const corpo = novoElemento('div','corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}
//cria par de barreiras
function ParDeBarreiras(altura,abertura,x){
    this.elemento=novoElemento('div','par-de-barreiras')

    this.superior= new Barreira(true)
    this.inferior= new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura=()=> {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura-abertura-alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    
    this.getX = ()=> parseInt(this.elemento.style.left.split('px')[0])
    this.setX =x=>this.elemento.style.left=`${x}px`
    this.getLargura = ()=>this.elemento.clientWidth

     this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura,largura,abertura,espaco,notificarPonto){
    this.pares=[
        new ParDeBarreiras(altura,abertura,largura),
        new ParDeBarreiras(altura,abertura,largura + espaco),
        new ParDeBarreiras(altura,abertura,largura + espaco * 2),
        new ParDeBarreiras(altura,abertura,largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar=()=>{
        this.pares.forEach(par=>{
            par.setX(par.getX() - deslocamento)

           //quando o elemento sair da área do jogo
           if(par.getX() < -par.getLargura()){
            par.setX(par.getX()+espaco* this.pares.length)
            par.sortearAbertura()
           } 

           const meio = largura/2
           const cruzouOMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio
           if(cruzouOMeio) notificarPonto()
           
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    this.elemento=novoElemento('img','passaro')
    this.elemento.src = 'img/passaro.png'

    this.getY=()=>parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY=(y)=>this.elemento.style.bottom=`${y}px`

    window.onkeydown = e=>voando = true
    window.onkeyup = e=>voando = false

    this.animar=()=>{
        const novoY = this .getY() + (voando ? 8:-5)
        const alturaMaxima= alturaJogo-this.elemento.clientHeight

        if(novoY <=0){
            this.setY(0)
        }else if(novoY >=alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo/2)
}

function Progresso(){
    this.elemento=novoElemento('span', 'progresso')
    this.atualizarPontos= pontos =>{
        this.elemento.innerHTML =pontos
    }
    this.atualizarPontos(0)
}

function estaoSobreposto(elementoA,elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    const ladoDireitoA = a.left+a.width 
    const ladoDireitoB = b.left+b.width
    const ladoBaixoA = a.top+a.height
    const ladoBaixoB =b.top+b.height
    
    const horrizontal = ladoDireitoA >=b.left 
        && ladoDireitoB >=a.left
    const vertical = ladoBaixoA >=b.top 
        && ladoBaixoB >= a.top
    return horrizontal && vertical
}

function colidiu(passaro,barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras =>{
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu =estaoSobreposto(passaro.elemento,superior)
                || estaoSobreposto(passaro.elemento, inferior)
        }
        
    })
    return colidiu
}

    

function FlappyBird(){
    let pontos=0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const espaco=400
    const abertura=200

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura,largura,abertura,espaco,
        ()=>progresso.atualizarPontos(++pontos))
    const passaro= new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    this.start = () =>{
        const temporizador =setInterval(()=>{
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro,barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }
}
   
new FlappyBird().start()