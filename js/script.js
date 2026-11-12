function formatar(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function lerLista(chave) {
  var texto = localStorage.getItem(chave);
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}


function salvarLista(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}


function lerUsuario() {
  var texto = localStorage.getItem('usuario');
  if (texto === null) {
    return null;
  }
  return JSON.parse(texto);
}

function iniciarPagina() {
  var carrinho = lerLista('carrinho');
  var total = 0;
  for (var i = 0; i < carrinho.length; i++) {
    total = total + carrinho[i].quantidade;
  }
  document.getElementById('contador').textContent = total;

  var usuario = lerUsuario();
  if (usuario !== null) {
    var primeiroNome = usuario.nome.split(' ')[0];
    document.getElementById('area-usuario').innerHTML = '<a href="perfil.html" id="link-perfil"></a>';
    document.getElementById('link-perfil').textContent = 'Olá, ' + primeiroNome;
  }
}



function filtrar() {
  var texto = document.getElementById('busca').value.toLowerCase();
  var categoria = document.getElementById('categoria').value;
  var produtos = document.getElementsByClassName('produto');
  var visiveis = 0;

  for (var i = 0; i < produtos.length; i++) {
    var nome = produtos[i].getAttribute('data-nome').toLowerCase();
    var cat = produtos[i].getAttribute('data-categoria');
    var mostrar = true;

    if (nome.indexOf(texto) === -1) {
      mostrar = false;
    }
    if (categoria !== 'todos' && categoria !== cat) {
      mostrar = false;
    }

    if (mostrar === true) {
      produtos[i].style.display = 'block';
      visiveis = visiveis + 1;
    } else {
      produtos[i].style.display = 'none';
    }
  }

  document.getElementById('total-produtos').textContent = visiveis + ' produtos';

  if (visiveis === 0) {
    document.getElementById('nenhum-produto').style.display = 'block';
  } else {
    document.getElementById('nenhum-produto').style.display = 'none';
  }
}


function limparFiltros() {
  document.getElementById('busca').value = '';
  document.getElementById('categoria').value = 'todos';
  filtrar();
}



function adicionar(id, nome, preco, imagem, categoria) {
  var quantidade = 1;

  
  var campo = document.getElementById('qtd' + id);
  if (campo !== null) {
    quantidade = parseInt(campo.value);
    if (isNaN(quantidade) || quantidade < 1) {
      quantidade = 1;
    }
  }

  var carrinho = lerLista('carrinho');
  var achou = false;

  for (var i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === id) {
      carrinho[i].quantidade = carrinho[i].quantidade + quantidade;
      achou = true;
    }
  }

  if (achou === false) {
    var produto = {
      id: id,
      nome: nome,
      preco: preco,
      imagem: imagem,
      categoria: categoria,
      quantidade: quantidade
    };
    carrinho.push(produto);
  }

  salvarLista('carrinho', carrinho);
  iniciarPagina();
  alert(nome + ' adicionado ao carrinho!');
}

function calcularTotais() {
  var carrinho = lerLista('carrinho');
  var subtotal = 0;

  for (var i = 0; i < carrinho.length; i++) {
    subtotal = subtotal + carrinho[i].preco * carrinho[i].quantidade;
  }

 
  var entrega = 8.9;
  if (subtotal >= 70 || carrinho.length === 0) {
    entrega = 0;
  }

  
  var desconto = 0;
  if (localStorage.getItem('cupom') === 'sim') {
    desconto = subtotal * 0.1;
  }

  var totais = {
    subtotal: subtotal,
    entrega: entrega,
    desconto: desconto,
    total: subtotal + entrega - desconto
  };
  return totais;
}


function mostrarCarrinho() {
  var carrinho = lerLista('carrinho');

  if (carrinho.length === 0) {
    document.getElementById('carrinho-vazio').style.display = 'block';
    document.getElementById('carrinho-cheio').style.display = 'none';
    return;
  }

  document.getElementById('carrinho-vazio').style.display = 'none';
  document.getElementById('carrinho-cheio').style.display = 'grid';

  var linhas = '';
  for (var i = 0; i < carrinho.length; i++) {
    var item = carrinho[i];
    linhas = linhas + '<tr>';
    linhas = linhas + '<td><div class="item-produto"><img src="' + item.imagem + '" alt="' + item.nome + '">' + item.nome + '</div></td>';
    linhas = linhas + '<td>' + formatar(item.preco) + '</td>';
    linhas = linhas + '<td class="qtd-botoes">';
    linhas = linhas + '<button onclick="mudarQuantidade(' + i + ', -1)">-</button>';
    linhas = linhas + '<span>' + item.quantidade + '</span>';
    linhas = linhas + '<button onclick="mudarQuantidade(' + i + ', 1)">+</button>';
    linhas = linhas + '</td>';
    linhas = linhas + '<td>' + formatar(item.preco * item.quantidade) + '</td>';
    linhas = linhas + '<td><button class="btn-remover" onclick="removerItem(' + i + ')">Remover</button></td>';
    linhas = linhas + '</tr>';
  }
  document.getElementById('itens-carrinho').innerHTML = linhas;

  var totais = calcularTotais();
  document.getElementById('subtotal').textContent = formatar(totais.subtotal);

  if (totais.entrega === 0) {
    document.getElementById('entrega').textContent = 'Grátis';
  } else {
    document.getElementById('entrega').textContent = formatar(totais.entrega);
  }

  if (totais.desconto > 0) {
    document.getElementById('linha-desconto').style.display = 'flex';
    document.getElementById('desconto').textContent = '- ' + formatar(totais.desconto);
  } else {
    document.getElementById('linha-desconto').style.display = 'none';
  }

  document.getElementById('total').textContent = formatar(totais.total);
}


function mudarQuantidade(posicao, valor) {
  var carrinho = lerLista('carrinho');
  carrinho[posicao].quantidade = carrinho[posicao].quantidade + valor;
  if (carrinho[posicao].quantidade < 1) {
    carrinho[posicao].quantidade = 1;
  }
  salvarLista('carrinho', carrinho);
  mostrarCarrinho();
  iniciarPagina();
}


function removerItem(posicao) {
  var carrinho = lerLista('carrinho');
  carrinho.splice(posicao, 1);
  salvarLista('carrinho', carrinho);
  mostrarCarrinho();
  iniciarPagina();
}


function aplicarCupom() {
  var codigo = document.getElementById('cupom').value.toUpperCase();
  if (codigo === 'BROTHER10') {
    localStorage.setItem('cupom', 'sim');
    alert('Cupom aplicado: 10% de desconto!');
  } else {
    localStorage.removeItem('cupom');
    alert('Cupom inválido. Tente BROTHER10.');
  }
  mostrarCarrinho();
}


function finalizarPedido() {
  var usuario = lerUsuario();
  if (usuario === null) {
    alert('Entre na sua conta para finalizar o pedido.');
    window.location.href = 'login.html';
    return;
  }

  var totais = calcularTotais();
  var pedidos = lerLista('pedidos');

  var pedido = {
    id: '#BB-' + Math.floor(2000 + Math.random() * 7000),
    data: new Date().toLocaleString('pt-BR'),
    itens: lerLista('carrinho'),
    total: totais.total,
    pagamento: 'Pagamento na entrega',
    status: 'Recebido'
  };

 
  pedidos.unshift(pedido);
  salvarLista('pedidos', pedidos);


  salvarLista('carrinho', []);
  localStorage.removeItem('cupom');

  alert('Pedido recebido! Já vamos preparar.');
  window.location.href = 'pedidos.html';
}




function mostrarPedidos() {
  var usuario = lerUsuario();
  if (usuario === null) {
    document.getElementById('pedidos-sem-login').style.display = 'block';
    return;
  }

  var pedidos = lerLista('pedidos');
  if (pedidos.length === 0) {
    document.getElementById('pedidos-vazio').style.display = 'block';
    return;
  }

  var html = '';
  for (var i = 0; i < pedidos.length; i++) {
    var pedido = pedidos[i];
    html = html + '<div class="pedido">';
    html = html + '<div class="pedido-topo">';
    html = html + '<div><h3>' + pedido.id + '</h3><small>' + pedido.data + '</small></div>';
    html = html + '<span class="status">' + pedido.status + '</span>';
    html = html + '</div>';
    html = html + '<ul>';
    for (var j = 0; j < pedido.itens.length; j++) {
      var item = pedido.itens[j];
      html = html + '<li>' + item.quantidade + 'x ' + item.nome + ' - ' + formatar(item.preco * item.quantidade) + '</li>';
    }
    html = html + '</ul>';
    html = html + '<p>Pagamento: ' + pedido.pagamento + '</p>';
    html = html + '<p class="pedido-total">Total: ' + formatar(pedido.total) + '</p>';
    html = html + '</div>';
  }
  document.getElementById('lista-pedidos').innerHTML = html;
}



function mostrarErros(lista) {
  var html = '';
  for (var i = 0; i < lista.length; i++) {
    html = html + '<li>' + lista[i] + '</li>';
  }
  document.getElementById('erros').innerHTML = html;
}

function cadastrar() {
  var nome = document.getElementById('nome').value.trim();
  var email = document.getElementById('email').value.trim();
  var telefone = document.getElementById('telefone').value.trim();
  var senha = document.getElementById('senha').value;
  var confirmar = document.getElementById('confirmar').value;
  var erros = [];

  if (nome === '') {
    erros.push('Digite seu nome completo.');
  }
  if (email.indexOf('@') === -1) {
    erros.push('Digite um e-mail válido.');
  }
  if (telefone.replace(/\D/g, '').length < 10) {
    erros.push('Digite um telefone válido.');
  }
  if (senha.length < 6) {
    erros.push('A senha precisa ter pelo menos 6 caracteres.');
  }
  if (senha !== confirmar) {
    erros.push('As senhas não coincidem.');
  }
  if (document.getElementById('termos').checked === false) {
    erros.push('Você precisa aceitar os termos.');
  }

  if (erros.length > 0) {
    mostrarErros(erros);
    return false;
  }

  var usuario = {
    nome: nome,
    email: email,
    telefone: telefone,
    endereco: ''
  };
  localStorage.setItem('usuario', JSON.stringify(usuario));
  alert('Conta criada! Bem-vindo à família.');
  window.location.href = 'perfil.html';
  return false;
}

function entrar() {
  var email = document.getElementById('email').value.trim();
  var senha = document.getElementById('senha').value;
  var erros = [];

  if (email.indexOf('@') === -1) {
    erros.push('Digite um e-mail válido.');
  }
  if (senha.length < 6) {
    erros.push('A senha precisa ter pelo menos 6 caracteres.');
  }

  if (erros.length > 0) {
    mostrarErros(erros);
    return false;
  }

  
  var usuario = lerUsuario();
  if (usuario === null || usuario.email !== email) {
    usuario = {
      nome: 'Brother Demo',
      email: email,
      telefone: '(11) 99999-2025',
      endereco: 'Rua da Crocância, 171 - Centro'
    };
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  alert('Login realizado com sucesso!');
  window.location.href = 'perfil.html';
  return false;
}

function esqueciSenha() {
  alert('Link de recuperação enviado (demonstração).');
}




function carregarPerfil() {
  var usuario = lerUsuario();
  if (usuario === null) {
    document.getElementById('perfil-sem-login').style.display = 'block';
    document.getElementById('perfil-conteudo').style.display = 'none';
    return;
  }

  document.getElementById('perfil-sem-login').style.display = 'none';
  document.getElementById('perfil-conteudo').style.display = 'block';

  document.getElementById('titulo-perfil').textContent = 'Olá, ' + usuario.nome.split(' ')[0] + '!';
  document.getElementById('nome').value = usuario.nome;
  document.getElementById('email').value = usuario.email;
  document.getElementById('telefone').value = usuario.telefone;
  document.getElementById('endereco').value = usuario.endereco;
  document.getElementById('qtd-pedidos').textContent = lerLista('pedidos').length;
}

function salvarPerfil() {
  var nome = document.getElementById('nome').value.trim();
  var email = document.getElementById('email').value.trim();
  var telefone = document.getElementById('telefone').value.trim();
  var endereco = document.getElementById('endereco').value;

  if (nome === '' || email === '' || telefone === '') {
    alert('Preencha os campos obrigatórios.');
    return;
  }

  var usuario = {
    nome: nome,
    email: email,
    telefone: telefone,
    endereco: endereco
  };
  localStorage.setItem('usuario', JSON.stringify(usuario));
  alert('Perfil atualizado com sucesso!');
  iniciarPagina();
  carregarPerfil();
}

function sair() {
  localStorage.removeItem('usuario');
  alert('Você saiu da conta.');
  window.location.href = 'index.html';
}
