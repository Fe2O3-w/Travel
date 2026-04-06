class TravelLog(SQLModel, table=True):
    __tablename__ = "travel_logs"
    id         : int | None = Field(default=None, primary_key=True)
    user_id    : uuid.UUID  = Field(foreign_key="user.id", index=True)
    city_name  : str        = Field(max_length=32, index=True)
    province   : str        = Field(max_length=32)
    title      : str        = Field(max_length=128)
    content    : str        = Field(max_length=4096)
    mood       : str        = Field(default="happy", max_length=16)   # happy/neutral/tired
    rating     : int        = Field(default=5)                         # 1-5
    visited_at : datetime   = Field(default_factory=datetime.utcnow)
    created_at : datetime   = Field(default_factory=datetime.utcnow)