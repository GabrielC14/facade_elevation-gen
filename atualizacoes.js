document.addEventListener('DOMContentLoaded', () => {
    // Adiciona uma classe ao body para aplicar os estilos corretos
    document.body.classList.add('notes-page');

    const contentContainer = document.getElementById('notes-content');

    // Usa a função fetch para buscar o arquivo markdown
    fetch('notas.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível carregar as notas de atualização.');
            }
            return response.text();
        })
        .then(markdownText => {
            // Usa a biblioteca 'marked' para converter o texto em HTML
            contentContainer.innerHTML = marked.parse(markdownText);
        })
        .catch(error => {
            console.error(error);
            contentContainer.innerHTML = '<p style="color: red;">Erro ao carregar as notas. Tente novamente mais tarde.</p>';
        });
});