package com.pulsepass.pulsepass.dto.response;

public class VenueResponseDto {
    private Long id;
    private String code;
    private String name;
    private String city;
    private String address;
    private Integer capacity;
    private Boolean active;

    // Constructores, Getters y Setters
    public VenueResponseDto() {}

    public VenueResponseDto(Long id, String code, String name, String city, String address, Integer capacity, Boolean active) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.city = city;
        this.address = address;
        this.capacity = capacity;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}