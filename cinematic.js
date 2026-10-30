/* One optional photo canvas per page. No loop runs when the scene is still. */
(() => {
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px)');
  const control = document.querySelector('[data-film-reduce]');
  if (control) {
    control.checked = motion.matches || root.dataset.motion === 'reduced';
    control.addEventListener('change', () => {
      root.dataset.motion = control.checked ? 'reduced' : 'full';
      try { sessionStorage.setItem('yumeiho-motion', root.dataset.motion); } catch (_) {}
    });
  }
  const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
  document.querySelectorAll('[data-film-story]').forEach(story => {
    const stage = story.querySelector('.film-stage');
    const images = [...stage.querySelectorAll('img')];
    const chapters = [...story.querySelectorAll('.film-chapter')];
    const count = stage.querySelector('[data-film-count]');
    const bar = stage.querySelector('.film-track span');
    const canvas = stage.querySelector('canvas');
    let active = false, near = false, frame = 0, target = 0, position = 0;
    let pointer = [0, 0], pointerTarget = [0, 0], renderer, generation = 0, attempted = false;
    function schedule() { if (!frame && active && near && !document.hidden) frame = requestAnimationFrame(draw); }
    function sync() {
      if (!active) return;
      const centers = chapters.map(el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; });
      const marker = innerHeight * .5;
      let next = 0;
      for (let i = 0; i < centers.length - 1; i++) {
        if (marker >= centers[i]) next = i + clamp((marker - centers[i]) / Math.max(1, centers[i + 1] - centers[i]), 0, 1);
      }
      target = clamp(next, 0, images.length - 1);
      const chosen = Math.round(target);
      chapters.forEach((el, i) => el.classList.toggle('is-current', i === chosen));
      count.textContent = `${String(chosen + 1).padStart(2, '0')} / 03`;
      bar.style.transform = `scaleX(${target / (images.length - 1)})`;
      schedule();
    }
    function draw() {
      frame = 0;
      if (!active || !near || document.hidden) return;
      position += (target - position) * .18;
      pointer = pointer.map((v, i) => v + (pointerTarget[i] - v) * .16);
      const index = Math.min(images.length - 1, Math.floor(position));
      const mix = position - index;
      images.forEach((img, i) => { img.style.opacity = String(i === index ? 1 : i === index + 1 ? mix : 0); });
      renderer?.draw(position, pointer);
      if (Math.abs(target - position) > .0005 || pointer.some((v, i) => Math.abs(v - pointerTarget[i]) > .0005)) schedule();
    }
    async function prepare() {
      if (attempted || !active || !near) return;
      attempted = true;
      const token = generation;
      try {
        await Promise.all(images.map(img => img.decode()));
        if (token !== generation || !active) return;
        renderer = createRenderer(canvas, images);
        story.classList.add('is-webgl');
        schedule();
      } catch (_) { story.classList.remove('is-webgl'); }
    }
    function configure() {
      const enabled = desktop.matches && !motion.matches && root.dataset.motion !== 'reduced';
      if (enabled === active) return;
      active = enabled;
      story.classList.toggle('story-enhanced', active);
      if (active) { sync(); prepare(); }
      else {
        generation++; attempted = false;
        cancelAnimationFrame(frame); frame = 0;
        renderer?.dispose(); renderer = null;
        story.classList.remove('is-webgl');
        images.forEach(img => img.style.removeProperty('opacity'));
      }
    }
    new IntersectionObserver(entries => {
      near = entries[0].isIntersecting;
      if (near) { sync(); prepare(); schedule(); }
      else { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: '100px' }).observe(story);
    const changed = new MutationObserver(configure);
    changed.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    motion.addEventListener('change', configure);
    desktop.addEventListener('change', configure);
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', () => { sync(); schedule(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { sync(); schedule(); } });
    stage.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !active) return;
      const r = stage.getBoundingClientRect();
      pointerTarget = [(event.clientX - r.left) / r.width - .5, (event.clientY - r.top) / r.height - .5]; schedule();
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { pointerTarget = [0, 0]; schedule(); });
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); story.classList.remove('is-webgl'); renderer = null; });
    configure();
  });

  function createRenderer(canvas, images) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) throw new Error('WebGL unavailable');
    const shaders = [], textures = [];
    function shader(type, source) {
      const result = gl.createShader(type); gl.shaderSource(result, source); gl.compileShader(result);
      shaders.push(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
      return result;
    }
    const program = gl.createProgram();
    try {
      gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=(aPosition+1.0)*0.5;gl_Position=vec4(aPosition,0.0,1.0);}'));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        varying vec2 vUv;
        uniform sampler2D uA; uniform sampler2D uB;
        uniform vec2 uSize; uniform vec2 uSizeA; uniform vec2 uSizeB; uniform vec2 uPointer;
        uniform float uProgress;
        vec4 contain(sampler2D image, vec2 size, vec2 uv){
          float stage=uSize.x/uSize.y; float aspect=size.x/size.y;
          vec2 scale=stage>aspect?vec2(aspect/stage,1.0):vec2(1.0,stage/aspect);
          vec2 p=(uv-0.5)/scale+0.5;
          float mask=step(0.0,p.x)*step(p.x,1.0)*step(0.0,p.y)*step(p.y,1.0);
          return mix(vec4(0.047,0.055,0.047,1.0),texture2D(image,clamp(p,0.0,1.0)),mask);
        }
        void main(){
          float envelope=sin(uProgress*3.14159265);
          float ribbon=sin(vUv.y*23.0+uProgress*5.0)*0.018*envelope;
          vec2 pointer=uPointer*0.006*sin(vUv.y*3.14159265);
          vec2 offset=vec2(ribbon,0.0)+pointer;
          float edge=(vUv.x+vUv.y*0.15)/1.15;
          float blend=smoothstep(edge-0.14,edge+0.14,uProgress*1.3-0.15);
          vec4 a=contain(uA,uSizeA,vUv+offset);
          vec4 b=contain(uB,uSizeB,vUv-offset);
          gl_FragColor=mix(a,b,blend);
        }`));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link failed');
    } catch (error) { shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); throw error; }
    const buffer = gl.createBuffer();
    gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    images.forEach(img => {
      const texture = gl.createTexture(); textures.push(texture); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    });
    const uniforms = Object.fromEntries(['uA','uB','uSize','uSizeA','uSizeB','uPointer','uProgress'].map(name => [name, gl.getUniformLocation(program, name)]));
    gl.uniform1i(uniforms.uA, 0); gl.uniform1i(uniforms.uB, 1);
    return {
      draw(progress, pointer) {
        const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
        const width = Math.max(1, Math.round(r.width * dpr)), height = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        gl.viewport(0, 0, width, height); gl.useProgram(program);
        const a = Math.min(images.length - 1, Math.floor(progress)), b = Math.min(images.length - 1, a + 1);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textures[a]);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textures[b]);
        gl.uniform2f(uniforms.uSize, width, height);
        gl.uniform2f(uniforms.uSizeA, images[a].naturalWidth, images[a].naturalHeight);
        gl.uniform2f(uniforms.uSizeB, images[b].naturalWidth, images[b].naturalHeight);
        gl.uniform2f(uniforms.uPointer, pointer[0], pointer[1]); gl.uniform1f(uniforms.uProgress, progress - a);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      dispose() { textures.forEach(t => gl.deleteTexture(t)); shaders.forEach(s => gl.deleteShader(s)); gl.deleteBuffer(buffer); gl.deleteProgram(program); }
    };
  }
})();
