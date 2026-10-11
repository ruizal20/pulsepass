package com.pulsepass.pulsepass.dto.response;

public class ArtistResponseDto {
    private Long id;
    private String stageName;
    private String biography;
    private String musicalGenre;

    public ArtistResponseDto() {}

    public ArtistResponseDto(Long id, String stageName, String biography, String musicalGenre) {
        this.id = id;
        this.stageName = stageName;
        this.biography = biography;
        this.musicalGenre = musicalGenre;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }

    public String getMusicalGenre() { return musicalGenre; }
    public void setMusicalGenre(String musicalGenre) { this.musicalGenre = musicalGenre; }
}