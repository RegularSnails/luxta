def square(n):
    return n*n

def test_square_false():
    assert square(3) == 7

def test_square_true():
    assert square(3) == 9
