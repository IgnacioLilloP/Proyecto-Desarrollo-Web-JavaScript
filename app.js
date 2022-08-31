
const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()

let carrito = {}


document.getElementById("comprar").onclick = function () {
    location.href="carrito.html";
};

document.addEventListener('DOMContentLoaded', e => {
    fetchData()
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
});
cards.addEventListener('click', e => {
    addCarrito(e)
});
items.addEventListener('click', e => {
    btnAumentarDisminuir(e)
})

// api
const fetchData = async () => {
    const res = await fetch('api.json');
    const data = await res.json()
    pintarCards(data)
}



// Render Card
const pintarCards = data => {

    data.forEach(item => {
        templateCard.querySelector('h5').textContent = item.nombre
        templateCard.querySelector('p').textContent = item.tomo
        templateCard.querySelector('span').textContent = new Intl.NumberFormat('es-AR').format(item.precio)
        templateCard.querySelector('img').src= item.imagen
        templateCard.querySelector('button').dataset.id = item.id
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)

    console.log(data)
}


// Agregar al carrito
const addCarrito = e => {
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement)
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'success',
            title: 'Item añadido al carrito '
          })
    }
    e.stopPropagation()

}

const setCarrito = item => {
    const producto = {
        nombre: item.querySelector('h5').textContent,
        precio: item.querySelector('span').textContent ,
        id: item.querySelector('button').dataset.id,
        cantidad: 1,
        tomo: item.querySelector('p').textContent,
        imagen: item.querySelector('img').src
        }
        
    console.log(producto)


    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1
    }

    carrito[producto.id] = {
        ...producto
    }

    pintarCarrito()
}


// render carrito
const pintarCarrito = () => {
    items.innerHTML = ''

    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('img').src = producto.imagen
        templateCarrito.querySelectorAll('td')[0].textContent = producto.nombre + "\n//\n" + producto.tomo
        templateCarrito.querySelectorAll('span')[0].textContent = producto.cantidad
        templateCarrito.querySelectorAll('span')[1].textContent =producto.precio* producto.cantidad

        //botones
        templateCarrito.querySelector('.btn-aumentar').dataset.id = producto.id
        templateCarrito.querySelector('.btn-disminuir').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    pintarFooter()
    localStorage.setItem('carrito', JSON.stringify(carrito))

}

const pintarFooter = () => {
    footer.innerHTML = ''

    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
          <th scope="row" colspan="5" class="text-center fontcarrito">Carrito vacío!</th>
          `
        return
    }

    // sumar cantidad y sumar totales
    const nCantidad = Object.values(carrito).reduce((acc, {
        cantidad
    }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, {
        cantidad,
        precio
    }) => acc + cantidad * precio, 0)



    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    document.getElementById('contador').textContent = nCantidad

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)

    footer.appendChild(fragment)



    const boton = document.querySelector('#vaciar-carrito')
    boton.addEventListener('click', () => {
        carrito = {}
        document.getElementById('contador').textContent = 0;
        pintarCarrito()
    })

}


const btnAumentarDisminuir = e => {
    if (e.target.classList.contains('btn-aumentar')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = {
            ...producto
        }
        pintarCarrito()
    }

    if (e.target.classList.contains('btn-disminuir')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        } else {
            carrito[e.target.dataset.id] = {
                ...producto
            }
        }
        pintarCarrito()
    }
    e.stopPropagation()
}

