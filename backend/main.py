import logging
import re
import unicodedata

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillmatch-ai")

app = FastAPI(
    title="SkillMatch AI — Resume Matcher",
    description="TF-IDF + cosine similarity resume-to-job matching API",
    version="1.0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOKEN_PATTERN = r"(?u)\b[\w#+.çğıöşüÇĞİÖŞÜ]{2,}\b"


class MatchRequest(BaseModel):
    job_description: str = Field(..., min_length=1)
    resume_text: str = Field(..., min_length=1)


class MatchResponse(BaseModel):
    match_score: float


def normalize_text(text: str) -> str:
    """Normalize whitespace and unicode for Turkish/English mixed text."""
    if not text:
        return ""
    cleaned = unicodedata.normalize("NFKC", text)
    cleaned = cleaned.replace("\x00", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def extract_tokens(text: str) -> set[str]:
    normalized = normalize_text(text).lower()
    return set(re.findall(TOKEN_PATTERN, normalized))


def keyword_overlap_percent(job: str, resume: str) -> float:
    job_tokens = extract_tokens(job)
    resume_tokens = extract_tokens(resume)
    if not job_tokens or not resume_tokens:
        return 0.0
    overlap = job_tokens & resume_tokens
    ratio = len(overlap) / len(job_tokens)
    return min(100.0, ratio * 100.0)


def tfidf_similarity_percent(job: str, resume: str) -> float:
    vectorizer = TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        stop_words=None,
        ngram_range=(1, 2),
        token_pattern=TOKEN_PATTERN,
        min_df=1,
        max_features=8000,
    )
    matrix = vectorizer.fit_transform([job, resume])
    similarity = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
    if similarity != similarity:  # NaN guard
        return 0.0
    return max(0.0, min(100.0, similarity * 100.0))


def compute_match_score(job_description: str, resume_text: str) -> float:
    job = normalize_text(job_description)
    resume = normalize_text(resume_text)

    if not job or not resume:
        logger.warning(
            "Empty input after normalize — job_len=%s resume_len=%s",
            len(job),
            len(resume),
        )
        raise HTTPException(
            status_code=422,
            detail="job_description and resume_text must contain readable text.",
        )

    if len(job) < 10 or len(resume) < 10:
        logger.warning(
            "Very short input — job_len=%s resume_len=%s preview_job=%r preview_resume=%r",
            len(job),
            len(resume),
            job[:80],
            resume[:80],
        )

    keyword_score = keyword_overlap_percent(job, resume)

    try:
        tfidf_score = tfidf_similarity_percent(job, resume)
    except ValueError as exc:
        logger.warning("TF-IDF failed (%s); using keyword overlap only.", exc)
        tfidf_score = 0.0

    # Blend semantic similarity with explicit token overlap for stable Turkish matching
    blended = (0.5 * tfidf_score) + (0.5 * keyword_score)

    # Avoid near-zero scores when there is real lexical overlap
    if keyword_score >= 15 and blended < keyword_score * 0.6:
        blended = keyword_score * 0.75

    score = round(min(100.0, max(0.0, blended)), 1)
    logger.info(
        "Match computed — tfidf=%.1f keyword=%.1f final=%.1f job_chars=%d resume_chars=%d",
        tfidf_score,
        keyword_score,
        score,
        len(job),
        len(resume),
    )
    return score


@app.get("/")
def root():
    return {"status": "ok", "service": "SkillMatch AI Resume Matcher"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/match", response_model=MatchResponse)
def match_resume(payload: MatchRequest):
    job = normalize_text(payload.job_description)
    resume = normalize_text(payload.resume_text)

    if not job or not resume:
        logger.error(
            "Rejected empty payload — raw job_len=%s resume_len=%s",
            len(payload.job_description or ""),
            len(payload.resume_text or ""),
        )
        raise HTTPException(
            status_code=422,
            detail="job_description and resume_text cannot be empty.",
        )

    score = compute_match_score(job, resume)
    return MatchResponse(match_score=score)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
