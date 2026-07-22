# Notas de Atualização da Versão 1.0.5 - 22/07/2026

## Novas Funcionalidades
1. **Inserção de linhas e colunas no meio do croqui**
   - Adicionados botões de inserção nos rótulos do grid para criar colunas entre letras e linhas entre números.
   - Componentes já posicionados são deslocados automaticamente quando uma nova linha ou coluna é inserida.

2. **Medidas em centímetros**
   - As larguras das colunas e alturas das linhas agora são exibidas em `cm`.
   - Os rótulos do grid mostram a identificação e a medida, como `A / 100cm` e `1 / 100cm`.

3. **Aplicação de medida em lote**
   - Adicionado controle para aplicar uma medida padrão em todas as colunas, todas as linhas ou em tudo.

4. **Exportação com cotas detalhadas**
   - A pré-visualização do croqui agora permite escolher entre `Apresentação` e `Detalhadas`.
   - O modo `Apresentação` mantém as cotas gerais `L` e `H`.
   - O modo `Detalhadas` gera cotas por módulo e cotas totais no formato `L: 500cm` e `H: 300cm`.
   - A imagem de pré-visualização é atualizada ao trocar o tipo de cota.

5. **Novo modo de inserção pela barra lateral**
   - Os componentes da barra lateral agora são inseridos por clique, sem precisar arrastar.
   - `Maxim-ar` e `Veneziana` permitem escolher entre inserir em um quadro específico ou preencher uma linha inteira.

## Correções
1. **Reposicionamento ao inserir no meio**
   - Corrigida a limitação em que novas linhas e colunas só podiam ser adicionadas no final do croqui.

## Ajustes
1. **Topbar**
   - Botões e campos da barra superior foram compactados para melhor encaixe.

2. **Interface dos componentes**
   - Adicionado destaque visual para o componente selecionado e para os quadros disponíveis no modo de inserção.
   - Adicionado botão para cancelar o modo de inserção.

---

# Notas de Atualização da Versão 1.0.4 - 09/07/2026

## Novas Funcionalidades
1. **Identidade na topbar**
   - Adicionada a logo e o nome `Criador de Croquis` no início da barra superior.


---

# Notas de Atualização da Versão 1.0.3 - 19/09/2025

## Novas Funcionalidades
1. **Menu `+` melhorado**
   - Melhorada a aparência do menu `+`, deixando-o no mesmo padrão visual da barra lateral de componentes.

2. **Menu de componentes melhorado**
   - Adicionada a descrição do item ao lado da imagem do componente.

## Correções
1. **Tamanho padrão de novas linhas**
   - Corrigido o problema em que novas linhas eram inseridas com `98px` por padrão.


---

# Notas de Atualização da Versão 1.0.2 - 10/09/2025

## Novas Funcionalidades
1. **Componente Porta de Giro**
   - Adicionada a opção de criar portas de 1 ou 2 módulos de altura.
   - Implementada a opção de porta com ou sem travessa para ambos os tamanhos.

2. **Componente Veneziana adaptativo**
   - O desenho da veneziana agora se adapta a qualquer altura de módulo definida pelo usuário.

## Correções
1. **Posicionamento e adaptação dos desenhos**
   - Corrigidos problemas de posicionamento e adaptação dos desenhos em relação aos tamanhos dos quadros.

## Ajustes
1. **Estrutura dos quadros**
   - Reformulada a estrutura de inserção de quadros. As linhas que dividem os quadros agora funcionam como zonas mortas.

---

# Notas de Atualização da Versão 1.0.1 - 05/08/2025

Aqui estão as principais mudanças e melhorias implementadas nesta versão:

## Novas Funcionalidades
1. **Lançamento inicial**
   - Primeira versão do aplicativo.