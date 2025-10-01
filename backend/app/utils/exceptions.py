class ValidationError(Exception):
    """Custom exception for validation errors"""
    def __init__(self, field: str, message: str, value = None):
        self.field = field
        self.message = message
        self.value = value
        super().__init__(f"Validation error in {field}: {message}")