import pdfplumber
import io
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def parse_resume(request):
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file uploaded'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    pdf_file = request.FILES['file']
    
    try:
        with pdfplumber.open(io.BytesIO(pdf_file.read())) as pdf:
            text = ''
            for page in pdf.pages:
                text += page.extract_text() or ''

        data = extract_cv_data(text)
        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def extract_cv_data(text):
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    skills_keywords = [
        'python', 'javascript', 'typescript', 'react', 'next.js', 'node',
        'django', 'sql', 'postgresql', 'mongodb', 'docker', 'git',
        'html', 'css', 'tailwind', 'java', 'c++', 'aws', 'firebase'
    ]

    found_skills = [
        skill for skill in skills_keywords 
        if skill.lower() in text.lower()
    ]

    return {
        'raw_text': text,
        'skills': found_skills,
        'line_count': len(lines),
        'summary': lines[:5],
    }