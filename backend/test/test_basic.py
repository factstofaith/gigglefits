"""
Basic tests to verify the testing framework is working
"""

import unittest

class TestBasicFunctionality(unittest.TestCase):
    """Basic test cases"""
    
    def test_addition(self):
        """Test that Python addition works (sanity test)"""
        self.assertEqual(2 + 2, 4)

if __name__ == "__main__":
    unittest.main()