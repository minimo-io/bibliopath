<template>
  <div class="about container pt-0">
    <div class="container primary-container pt-0 px-0 mt-3 mt-lg-5" no-body>

      <header class="alt-post-margins alt-top-title mx-0">
        <b-link @click="$router.go(-1)" class="breadcrumb-back-button">
          <i class="fas fa-reply"></i>&nbsp;back
        </b-link>

        <h1 class="post-title category-title" itemprop="name headline">
          <span>About us</span>
          <span class='app-text-green'>.</span>
        </h1>

        <div class="post-subtitle category-subtitle mt-3">

          <div role="alert" aria-live="polite" aria-atomic="true" class="alert alert-warning">
            <!----><span><strong>Bibliopath</strong> in under development.</span><span>
            Meanwhile we invite you to find out more about us in our <a href="#" rel="noopener" target="_blank" class="text-nowrap"> <i class="fab fa-patreon mr-1"></i>Patreon</a> account. </span></div>

          <figure class="figure">
            <b-img src="@/assets/andrew-neel--FVaZbu6ZAE-unsplash.jpg" rounded fluid alt="book-image-unsplash"></b-img>
            <figcaption class="figure-caption">Thanks to Andrew Neel</figcaption>
          </figure>


          <b-link href="#what" class="app-title Xapp-text-selected mt-4"><i class="fas fa-hashtag"></i> WHAT IN THE WORLD...?</b-link>
          <p class="mt-2">
            Bibliopath is an editorial project promoting Open reading & Open publishing.
            <br>
            If you are a visitor you will be able ro read, listen & discuss books based on Open Standards.
            If you are an author <a href="#" rel="noopener" target="_blank" class=""><span class="text-nowrap"><i class="fas fa-upload mr-1"></i>Publish for free</span></a> and get some <a href="/#" class="router-link-exact-active router-link-active" target="_self" aria-current="page"><i class="fas fa-hand-holding-usd"></i></a> and <a href="/#" class="router-link-exact-active router-link-active" target="_self" aria-current="page"><i class="fas fa-heart"></i></a> from your followers.
          </p>
          <p>
            We focus on having good quality public domain works & contemporary authors that see a potential in our open publishing model.

          </p>
          <p>Our goal is to create a community of authors and readers that can grow based on Open Standards.</p>


          <b-link href="#why" class="app-title Xapp-text-selected mt-4"><i class="fas fa-hashtag"></i> HOW DOES THIS THING WORK?</b-link>

          <p class="mt-2">
            Bibliopath has 4 types of users:
          </p>

          <p>
            <ol class='beer-list'>
              <li>
                <b-link to="#" class="Xbg-black"><i class="fas fa-mask mr-1"></i>ANONYMOUS</b-link>
                 Can read any book of the library & share fragments.
              </li>
              <li>
                <b-link to="#"><i class="fas fa-user mr-1"></i>USERS</b-link>
                After signin up for free can download books for offline reading. Listen to available audiobooks. Follow & donate to authors. Highlight & comment fragments & participate in discussions + What anonymous user can do.
              </li>
              <li>
                <b-link to="#"><i class='fas fa-graduation-cap mr-1'></i>BIBLIOPATHS</b-link>
                These are the <a href="https://www.instagram.com/hopmasters/" rel="noopener" target="_blank" class="text-nowrap"><i class="fab fa-patreon mr-1"></i>Patreon</a> donors to the project. Bibliopaths can access to featured books & authors -published by Bibliopath- and get free paper books + What normal user can do.

              </li>
              <li>
                <b-link to="#"><i class="fas fa-pen-fancy mr-1"></i>AUTHORS</b-link>
                Get to freely distribute their work through the platform! Get donors & followers and the ability to interact with their readers base.
              </li>
            </ol>
          </p>


          <b-link href="#who" class="app-title Xapp-text-selected mt-4"><i class="fas fa-hashtag"></i> WHO ARE YOU NUTS?</b-link>
          <p class="mt-2">A gang of readers with (some) programming skills <i class="fas fa-grin-beam-sweat"></i>
          <p>

            In fact, Bibliopath was developed by <b-link href="https://minimo.io/en/" target="_blank" class="text-nowrap"><i class="fas fa-circle mr-1"></i>Mínimo</b-link>,
            a digital ideas laboratory based in Uruguay, with the initiative of contributing to the Open World.
          </p>
          <p>
            More importantly Bibliopath is Free Software published at
              <b-link to="https://github.com/minimo-io/bibliopath"><i class="fab fa-github mr-1"></i>Github</b-link>,
              so if you know how code, your contributions are very welcome!
          </p>
        </div>
      </header>

    </div>
    <!-- <div class="book-box mt-2">

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

    </div> -->
  </div>
</template>
