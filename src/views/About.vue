<template>
  <div class="about container">
    <b-card class="book-header pb-4 pt-0 pt-md-3 pb-md-5 mb-4 mb-sm-0" no-body>

      <b-card-body class="z-index-6000">
        <div class="book-presentation pt-4">
          <h1>
            About us
          </h1>
          <div class="author-meta mt-2">
            <!-- by <b-avatar variant="light" size="2.2rem" :src="book.author.avatar" class="mr-2 ml-2"></b-avatar> -->
            <!-- <span class="mr-auto"><b-link :to="{ name: 'Author', params: { slug: book.author.slug } }">{{ book.author.name }}</b-link></span> -->
          </div>
        </div>
        <!-- <img :src="book.presentation" /> -->
        <!-- <div class="book-meta softer mb-3 text-center text-sm-left">
          <b-link href="#"><b-button variant="danger" size="sm" class="mr-2"><i class="far fa-heart mr-1"></i>Like<b-badge pill variant="light" class="ml-2 softer">252</b-badge></b-button></b-link>
          <b-link href="#"><b-button variant="info" size="sm" class="mr-2"><i class="fas fa-plus mr-1"></i>Info</b-button></b-link>
          <b-link href="#"><b-button variant="green" size="sm"><i class="fas fa-user mr-1"></i>Bio</b-button></b-link>
        </div> -->
        <!-- <div class="book-buy text-center">
          <b-link href="#" target="_blank" class="alt-aff-link softer">
            <i class="fab fa-amazon mr-1"></i>Comprar libro de bolsillo</b-link>
        </div> -->
      </b-card-body>
      <!-- <div class="overlay overlay-dark"></div> -->

    </b-card>
    <div class="book-box mt-2">

      <div class="book-content mt-5 padding-right-inherit">
        <p>Bibliopath es un proyecto editorial que promueve la lectura y la publicación abierta.</p>

        <p>Nos enfocamos en tener obras de dominio público de buena calidad y autores contemporáneos que vean un potencial en nuestro modelo editorial.</p>

        <p>Bibliopath tiene 4 tipos de usuarios:</p>
        <ul>
          <li><i class="bg-black">ANÓNIMOS</i> Pueden leer cualquier libro de la biblioteca y compartir fragmentos.</li>
          <li><i class="bg-black">USUARIOS</i> Pueden descargar libros para leer sin conexión. Escuchar los audiolibros disponibles. Seguir autores. Subrayar y comentar fragmentos, participar en debates + lo que puede hacer un usuario anónimo.</li>
          <li><i class="bg-black">BIBLIOPATHS</i> Estos son los donantes al proyecto. Los Bibliopaths pueden acceder a libros y autores destacados, publicados por Bibliopath, y obtener libros gratuitos en papel + lo que el usuario normal puede hacer.</li>
          <li><i class="bg-black">AUTORES</i> Pueden distribuir su trabajo a través de la plataforma ¡gratis! Obtener donantes, conseguir seguidores y la capacidad de interactuar con su base de lectores.</li>
        </ul>
      </div>

    </div>
  </div>
</template>
