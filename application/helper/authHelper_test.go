package helper

import "testing"

func TestEmailValid(t *testing.T) {
	testData := []struct {
		input    string
		expected bool
	}{
		{"test@example.com", true},
		{"test123@example.com", true},
		{"test.email@example.com", true},
		{"test.email+label@example.com", false},
		{"test.email+label@subdomain.example.com", false},
		{"test.email@sub-domain.example.com", true},
		{"test..email@example.com", false},
		{"test.email@", false},
		{"test.email@.com", false},
		{"test.email@domain.", false},
		{"test@.com", false},
		{"test@", false},
		{"", false},
	}

	for _, testItems := range testData {
		if result := EmailValid(testItems.input); result != testItems.expected {
			t.Errorf("EmailValid(%q) = %v; expected %v", testItems.input, result, testItems.expected)
		}
	}
}

func TestPasswordValid(t *testing.T) {
	testData := []struct {
		input    string
		expected bool
	}{
		{"Abc123def", true},
		{"Abcdef123", true},
		{"abc123DEF", true},
		{"12345abcDEFG", true},
		{"abcdefgh", false},
		{"ABCDEF123", false},
		{"ABC123DEF", false},
		{"abcde123", false},
		{"ABCD1234", false},
		{"", false},
	}

	for _, testItems := range testData {
		if result := PasswordValid(testItems.input); result != testItems.expected {
			t.Errorf("PasswordValid(%q) = %v; expected %v", testItems.input, result, testItems.expected)
		}
	}
}

func TestConfirmValid(t *testing.T) {
	testData := []struct {
		password string
		confirm  string
		expected bool
	}{
		{"password", "password", true},
		{"123456", "123456", true},
		{"Abcdef", "Abcdef", true},
		{"password", "Password", false},
		{"Abcdef", "abcdef", false},
		{"123456", "654321", false},
	}

	for _, testItems := range testData {
		if result := ConfirmValid(testItems.password, testItems.confirm); result != testItems.expected {
			t.Errorf("ConfirmValid(%q, %q) = %v; expected %v", testItems.password, testItems.confirm, result, testItems.expected)
		}
	}
}
