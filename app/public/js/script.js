let quill;

let renderQuill = () => {
    quill = new Quill('#editor', {theme: 'snow'});
    if (!!delta) {
        quill.setContents(delta)
    }
}

const saveFile = async () => {
    const delta = quill.getContents()
    try {
        const response = await fetch("/save", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(delta)
        })
        const data = await response.json()
        window.location.href = `/pasta/${data.id}`
    }catch (e){
        console.error(e)
        throw e
    }
}

document.getElementById("b_save").addEventListener("click", saveFile)