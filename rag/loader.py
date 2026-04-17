from pypdf import PdfReader
import docx


def load_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text


def load_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])


def load_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def load_file(file_path):
    if file_path.endswith(".pdf"):
        return load_pdf(file_path)

    elif file_path.endswith(".docx"):
        return load_docx(file_path)

    elif file_path.endswith(".txt"):
        return load_txt(file_path)

    else:
        raise Exception("Unsupported file format")